// gallery.js
import { Model } from 'sequelize';

export default class Gallery extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id_gallery: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'gallery',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_gallery' }],
          },
        ],
      }
    );
  }
}