"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diamond = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Diamond extends sequelize_1.Model {
}
exports.Diamond = Diamond;
Diamond.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    diamondId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    carat: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    cut: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    clarity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    basePrice: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
}, {
    tableName: "diamonds",
    sequelize: database_1.sequelize,
});
//# sourceMappingURL=Diamond.js.map