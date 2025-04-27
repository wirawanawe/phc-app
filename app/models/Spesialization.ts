import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { Spesialization } from "@/app/types";

// Define interface for Spesialization attributes for creation
export interface SpesializationCreationAttributes
  extends Optional<Spesialization, "id"> {}

// Define Spesialization model
export class SpesializationModel
  extends Model<Spesialization, SpesializationCreationAttributes>
  implements Spesialization
{
  public id!: string;
  public name!: string;
  public isActive!: boolean;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize Spesialization model
SpesializationModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    tableName: "Spesializations",
    timestamps: true,
  }
);

export default SpesializationModel;
