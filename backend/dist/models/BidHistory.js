"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidHistory = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
const DiamondBid_1 = require("./DiamondBid");
const UserBid_1 = require("./UserBid");
class BidHistory extends sequelize_1.Model {
}
exports.BidHistory = BidHistory;
BidHistory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userBidId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "user_bids",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
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
    bidAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    editedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    tableName: "bid_history",
    sequelize: database_1.sequelize,
    timestamps: false,
});
BidHistory.belongsTo(UserBid_1.UserBid, { foreignKey: "userBidId", as: "userBid" });
BidHistory.belongsTo(User_1.User, { foreignKey: "userId", as: "user" });
BidHistory.belongsTo(DiamondBid_1.DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });
UserBid_1.UserBid.hasMany(BidHistory, { foreignKey: "userBidId", as: "history" });
User_1.User.hasMany(BidHistory, { foreignKey: "userId", as: "bidHistory" });
DiamondBid_1.DiamondBid.hasMany(BidHistory, { foreignKey: "diamondBidId", as: "bidHistory" });
//# sourceMappingURL=BidHistory.js.map