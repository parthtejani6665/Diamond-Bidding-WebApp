"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
const DiamondBid_1 = require("./DiamondBid");
class Result extends sequelize_1.Model {
}
exports.Result = Result;
Result.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    diamondBidId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "diamond_bids",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    winnerId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "RESTRICT",
    },
    winningAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    declaredAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: "results",
    sequelize: database_1.sequelize,
});
Result.belongsTo(User_1.User, { foreignKey: "winnerId", as: "winner" });
Result.belongsTo(DiamondBid_1.DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });
User_1.User.hasMany(Result, { foreignKey: "winnerId", as: "wonResults" });
DiamondBid_1.DiamondBid.hasOne(Result, { foreignKey: "diamondBidId", as: "result" });
//# sourceMappingURL=Result.js.map