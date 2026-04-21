import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Product } from "./Product";
import { User } from "./User";

interface CartItemAttributes {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}
interface CartItemCreationAttributes extends Optional<CartItemAttributes, "id"> {}
export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public quantity!: number;
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
  },
  { sequelize, tableName: "cart_items", timestamps: false }
);

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
interface OrderAttributes {
  id: number;
  userId: number;
  status: OrderStatus;
  total: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface OrderCreationAttributes extends Optional<OrderAttributes, "id" | "status"> {}
export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public userId!: number;
  public status!: OrderStatus;
  public total!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending"
    },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: "orders" }
);

interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
}
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id"> {}
export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: string;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  },
  { sequelize, tableName: "order_items", timestamps: false }
);

User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });
Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "RESTRICT" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

export { User, Product };
