// user.js
import { Model } from 'sequelize';

export default class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id_user: {
          autoIncrement: true,
          type: DataTypes.INTEGER, // Sử dụng DataTypes thay vì Sequelize
          allowNull: false,
          primaryKey: true,
        },
        fullname: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
        },
        phone_number: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('user', 'admin'),
          allowNull: true,
          defaultValue: 'user',
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        verification_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        verification_token_expires: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize, // Sử dụng instance sequelize được truyền vào
        tableName: 'user',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_user' }],
          },
          {
            name: 'email',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'email' }],
          },
        ],
      }
    );
  }
}