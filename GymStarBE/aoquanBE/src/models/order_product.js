// order_product.js
import { Model } from 'sequelize';

export default class OrderProduct extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id_order_product: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        id_order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'id_order',
          },
        },
        id_product: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'product',
            key: 'id_product',
          },
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'order_product',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_order_product' }],
          },
          {
            name: 'FK_ORDER_PRODUCT_ORDER',
            using: 'BTREE',
            fields: [{ name: 'id_order' }],
          },
          {
            name: 'FK_ORDER_PRODUCT_PRODUCT',
            using: 'BTREE',
            fields: [{ name: 'id_product' }],
          },
        ],
      }
    );
  }
}