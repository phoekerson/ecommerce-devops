import bcrypt from "bcryptjs";
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

type UserRole = "user" | "admin";

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "role"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: UserRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
  }

  public toJSON(): object {
    const values = { ...this.get() } as Partial<UserAttributes>;
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), allowNull: false, defaultValue: "user" }
  },
  {
    sequelize,
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);
