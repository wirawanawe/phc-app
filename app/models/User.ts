import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { User } from "@/app/types";
import bcrypt from "bcryptjs";

// Define interface for User attributes for creation
export interface UserCreationAttributes
  extends Optional<User, "id" | "createdAt" | "lastLogin"> {}

// Define User model
export class UserModel
  extends Model<User, UserCreationAttributes>
  implements User
{
  public id!: string;
  public username!: string;
  public email!: string;
  public fullName!: string;
  public password!: string;
  public role!: string;
  public isActive!: boolean;
  public lastLogin?: string;
  public createdAt!: string;

  // Additional fields for internal use
  public readonly updatedAt!: Date;

  // Method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

// Initialize User model
UserModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: "participant",
      validate: {
        isIn: [["admin", "staff", "doctor", "participant", "part"]],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
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
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user: UserModel) => {
        if (user.password) {
          // Hash password before storing
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: UserModel) => {
        if (user.changed("password") && user.password) {
          // Hash password before updating
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default UserModel;
