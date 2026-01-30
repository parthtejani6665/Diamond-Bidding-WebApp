"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBid = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
const DiamondBid_1 = require("./DiamondBid");
class UserBid extends sequelize_1.Model {
}
exports.UserBid = UserBid;
UserBid.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
    currentBidAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
}, {
    tableName: "user_bids",
    sequelize: database_1.sequelize,
});
UserBid.belongsTo(User_1.User, { foreignKey: "userId", as: "user" });
UserBid.belongsTo(DiamondBid_1.DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });
User_1.User.hasMany(UserBid, { foreignKey: "userId", as: "bids" });
DiamondBid_1.DiamondBid.hasMany(UserBid, { foreignKey: "diamondBidId", as: "userBids" });
//# sourceMappingURL=UserBid.js.map