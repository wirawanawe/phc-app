import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/db.config";
import { ProgramCategoryModel } from "./ProgramCategory";

interface HealthProgramAttributes {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  maxParticipants: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define HealthProgram model class
export class HealthProgram
  extends Model<HealthProgramAttributes>
  implements HealthProgramAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public categoryId!: string | null;
  public startDate!: Date;
  public endDate!: Date | null;
  public location!: string | null;
  public maxParticipants!: number | null;
  public status!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initializeHealthProgramModel = (sequelize: Sequelize) => {
  HealthProgram.init(
    {
      id: {
        type: DataTypes.STRING(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        references: {
          model: "program_categories",
          key: "id",
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "health_programs",
      modelName: "HealthProgram",
    }
  );

  return HealthProgram;
};

export const setHealthProgramAssociations = () => {
  HealthProgram.belongsTo(ProgramCategoryModel, {
    foreignKey: "categoryId",
    as: "category",
  });
};

// Initialize the model
initializeHealthProgramModel(sequelize);
// Set associations
setHealthProgramAssociations();

export const HealthProgramModel = HealthProgram;
