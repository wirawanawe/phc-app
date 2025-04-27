import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { ProgramCategory } from "@/app/types";

// Define interface for ProgramCategory attributes for creation
export interface ProgramCategoryCreationAttributes
  extends Optional<
    ProgramCategory,
    "id" | "createdAt" | "description" | "color"
  > {}

// Define ProgramCategory model
export class ProgramCategoryModel
  extends Model<ProgramCategory, ProgramCategoryCreationAttributes>
  implements ProgramCategory
{
  public id!: string;
  public name!: string;
  public description?: string;
  public color?: string;
  public isActive!: boolean;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize ProgramCategory model
ProgramCategoryModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "blue",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "program_categories",
    timestamps: true,
  }
);

export default ProgramCategoryModel;
