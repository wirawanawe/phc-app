import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { Participant } from "@/app/types";

// Define interface for Participant attributes for creation
export interface ParticipantCreationAttributes
  extends Optional<
    Participant,
    | "id"
    | "createdAt"
    | "phone"
    | "dateOfBirth"
    | "address"
    | "identityNumber"
    | "insuranceId"
    | "insuranceNumber"
  > {}

// Define Participant model
export class ParticipantModel
  extends Model<Participant, ParticipantCreationAttributes>
  implements Participant
{
  public id!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public dateOfBirth?: string;
  public address?: string;
  public identityNumber?: string;
  public insuranceId?: string;
  public insuranceNumber?: string;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize Participant model
ParticipantModel.init(
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    identityNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    insuranceId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: "Insurances",
        key: "id",
      },
    },
    insuranceNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "participants",
    timestamps: true,
  }
);

export default ParticipantModel;
