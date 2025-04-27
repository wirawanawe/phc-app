const { initializeDatabase, UserModel } = require("../app/models");

/**
 * This script checks if there are any users in the database.
 * If no users are found, it creates a default admin user.
 */
async function createAdminIfNoUsers() {
  try {
    console.log("Checking database connection...");
    // Initialize the database connection
    await initializeDatabase();

    console.log("Checking if users exist...");
    const userCount = await UserModel.count();

    if (userCount === 0) {
      console.log("No users found. Creating default admin user...");
      const defaultAdmin = await UserModel.create({
        username: "admin",
        email: "admin@example.com",
        fullName: "System Administrator",
        password: "admin123", // This will be hashed by the beforeCreate hook
        role: "admin",
        isActive: true,
      });
      console.log("Created default admin user with ID:", defaultAdmin.id);
      console.log("Username: admin");
      console.log("Password: admin123");
      console.log("Please change the password after login!");
    } else {
      console.log(
        `Found ${userCount} users in the database. No action needed.`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the function
createAdminIfNoUsers();
