import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { Insurance } from "@/app/types";

// Define interface for Insurance attributes for creation
export interface InsuranceCreationAttributes
  extends Optional<Insurance, "id"> {}

// Define Insurance model
export class InsuranceModel
  extends Model<Insurance, InsuranceCreationAttributes>
  implements Insurance
{
  public id!: string;
  public name!: string;
  public description!: string;
  public coverage!: string;
  public isActive!: boolean;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize Insurance model
InsuranceModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverage: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "Insurances",
    timestamps: true,
  }
);

export default InsuranceModel;
