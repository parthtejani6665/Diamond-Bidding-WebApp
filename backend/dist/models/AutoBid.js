"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBid = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
const DiamondBid_1 = require("./DiamondBid");
class AutoBid extends sequelize_1.Model {
}
exports.AutoBid = AutoBid;
AutoBid.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    diamondBidId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "diamond_bids", key: "id" },
        onDelete: "CASCADE",
    },
    maxAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    incrementAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
}, {
    tableName: "auto_bids",
    sequelize: database_1.sequelize,
    underscored: true,
    indexes: [{ unique: true, fields: ["user_id", "diamond_bid_id"] }],
});
AutoBid.belongsTo(User_1.User, { foreignKey: "userId", as: "user" });
AutoBid.belongsTo(DiamondBid_1.DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });
User_1.User.hasMany(AutoBid, { foreignKey: "userId", as: "autoBids" });
DiamondBid_1.DiamondBid.hasMany(AutoBid, { foreignKey: "diamondBidId", as: "autoBids" });
//# sourceMappingURL=AutoBid.js.map