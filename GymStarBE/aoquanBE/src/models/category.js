import { Model } from 'sequelize';

export default class Category extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id_category: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'category',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_category' }],
          },
        ],
      }
    );
  }
}