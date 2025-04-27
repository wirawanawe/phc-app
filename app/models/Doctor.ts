import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { Doctor } from "@/app/types";

// Define interface for Doctor attributes for creation
export interface DoctorCreationAttributes
  extends Optional<
    Doctor,
    "id" | "createdAt" | "email" | "phone" | "schedule"
  > {}

// Define Doctor model
export class DoctorModel
  extends Model<Doctor, DoctorCreationAttributes>
  implements Doctor
{
  public id!: string;
  public name!: string;
  public spesialization!: string;
  public email?: string;
  public phone?: string;
  public schedule?: string;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize Doctor model
DoctorModel.init(
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
    spesialization: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "specialization",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    schedule: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON string containing the doctor's practice schedule",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "doctors",
    timestamps: true,
  }
);

export default DoctorModel;
