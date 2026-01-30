"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiamondBid = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
class DiamondBid extends sequelize_1.Model {
}
exports.DiamondBid = DiamondBid;
DiamondBid.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    diamondName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    diamondId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    diamondImageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    baseDiamondPrice: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    baseBidPrice: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    startDateTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDateTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "active", "closed"),
        allowNull: false,
        defaultValue: "draft",
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    resultDeclared: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    winnerId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: "users",
            key: "id",
        },
    },
    declaredAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "diamond_bids",
    sequelize: database_1.sequelize,
});
DiamondBid.belongsTo(User_1.User, { foreignKey: "createdBy", as: "creator" });
DiamondBid.belongsTo(User_1.User, { foreignKey: "winnerId", as: "winner" });
//# sourceMappingURL=DiamondBid.js.map