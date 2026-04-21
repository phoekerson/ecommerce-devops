import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ProductAttributes {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "imageUrl"> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: string;
  public imageUrl!: string | null;
  public stock!: number;
  public category!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    category: { type: DataTypes.STRING, allowNull: false }
  },
  {
    sequelize,
    tableName: "products"
  }
);
