// orders.js (khuyến nghị)
import { Model } from 'sequelize';

export default class Order extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id_order: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        id_user: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id_user',
          },
        },
        note: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'orders',
        timestamps: true,
        createdAt: 'order_date', // Ánh xạ createdAt thành order_date
        updatedAt: false, // Tắt updatedAt nếu không cần
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_order' }],
          },
          {
            name: 'FK_ORDER_USER',
            using: 'BTREE',
            fields: [{ name: 'id_user' }],
          },
        ],
      }
    );
  }
}