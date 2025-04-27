import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { Appointment } from "@/app/types";
import ParticipantModel from "./Participant";
import DoctorModel from "./Doctor";

// Define interface for Appointment attributes for creation
export interface AppointmentCreationAttributes
  extends Optional<Appointment, "id" | "createdAt" | "time" | "notes"> {}

// Define Appointment model
export class AppointmentModel
  extends Model<Appointment, AppointmentCreationAttributes>
  implements Appointment
{
  public id!: string;
  public participantId!: string;
  public doctorId!: string;
  public date!: string;
  public time?: string;
  public status!: "scheduled" | "completed" | "cancelled";
  public notes?: string;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;
}

// Initialize Appointment model
AppointmentModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    participantId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: ParticipantModel,
        key: "id",
      },
    },
    doctorId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: DoctorModel,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: "appointments",
    timestamps: true,
  }
);

// Define associations
AppointmentModel.belongsTo(ParticipantModel, {
  foreignKey: "participantId",
  as: "participant",
});
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});

export default AppointmentModel;
