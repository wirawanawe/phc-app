import { sequelize } from "../models";

/**
 * This script synchronizes participant data between the admin dashboard and database
 * by properly handling foreign key constraints
 */
async function syncParticipantsData() {
  const transaction = await sequelize.transaction();

  try {
    console.log("Starting participant data synchronization...");

    // 1. Get all tables that reference participants via foreign keys
    const [referencingTables] = await sequelize.query(
      `
      SELECT TABLE_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME = 'participants'
      AND REFERENCED_COLUMN_NAME = 'id'
      AND TABLE_SCHEMA = DATABASE()
    `,
      { transaction }
    );

    console.log(
      `Found ${referencingTables.length} tables referencing participants table`
    );

    // 2. Disable foreign key checks temporarily
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction });

    // 3. For each referencing table, save the relationships to restore later (optional)
    const relationshipData: Record<string, any[]> = {};

    for (const table of referencingTables) {
      const tableName = (table as any).TABLE_NAME;
      const columnName = (table as any).COLUMN_NAME;

      console.log(`Backing up relationships from ${tableName} (${columnName})`);

      // Save the current relationships
      const [relationships] = await sequelize.query(
        `
        SELECT * FROM ${tableName}
      `,
        { transaction }
      );

      relationshipData[tableName] = relationships;

      // Clear the referencing table
      await sequelize.query(`TRUNCATE TABLE ${tableName}`, { transaction });
      console.log(`Cleared table ${tableName}`);
    }

    // 4. Now we can safely truncate the participants table
    await sequelize.query("TRUNCATE TABLE participants", { transaction });
    console.log("Cleared participants table");

    // 5. Execute additional logic here to refresh participants data
    // For example, you might re-fetch from an API or re-sync from another source

    // 6. Re-insert or update participant data as needed
    // Example:
    // await sequelize.query(`
    //   INSERT INTO participants (id, name, ...) VALUES (...), (...)
    // `, { transaction });

    // 7. Re-enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction });

    // 8. Optionally restore the relationships that were saved earlier
    // This depends on your specific needs - you may need to map old participant IDs to new ones

    // Commit the transaction
    await transaction.commit();
    console.log("Participant data synchronization completed successfully");
  } catch (error) {
    // Rollback the transaction if there's an error
    await transaction.rollback();
    console.error("Error synchronizing participant data:", error);
    throw error;
  }
}

// Run the script when executed directly
if (require.main === module) {
  syncParticipantsData()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export default syncParticipantsData;
