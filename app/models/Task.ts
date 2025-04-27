import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db.config";
import { Task } from "@/app/types";

// Define interface for Task attributes
export interface TaskAttributes extends Task {
  updatedAt: Date;
}

// Define interface for Task creation attributes
export type TaskCreationAttributes = Optional<
  TaskAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "timePerformed"
  | "completedAt"
  | "completedBy"
>;

// Define Task model
export class TaskModel
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: string;
  public healthProgramId!: string;
  public title!: string;
  public description!: string;
  public timePerformed?: string;
  public status!: "active" | "inactive";
  public priority!: "low" | "medium" | "high";
  public completedAt?: string;
  public completedBy?: string;
  public createdAt!: string;
  public readonly updatedAt!: Date;
}

// Initialize Task model
export const initializeTaskModel = (sequelize: Sequelize) => {
  TaskModel.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      healthProgramId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timePerformed: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedBy: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "tasks",
      timestamps: true,
    }
  );

  return TaskModel;
};

// Set associations function to be called after all models are initialized
export const setTaskAssociations = () => {
  // Import here to avoid circular dependency
  const { HealthProgramModel } = require("./HealthProgram");

  TaskModel.belongsTo(HealthProgramModel, {
    foreignKey: "healthProgramId",
    as: "healthProgram",
  });

  HealthProgramModel.hasMany(TaskModel, {
    foreignKey: "healthProgramId",
    as: "tasks",
  });
};

// Initialize the model
initializeTaskModel(sequelize);

export default TaskModel;
