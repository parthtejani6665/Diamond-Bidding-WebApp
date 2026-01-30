"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyResults = exports.listAllResults = exports.declareResult = exports.getBidHistoryForDiamond = exports.getAllBidsForDiamond = exports.declareResultIfClosed = void 0;
const sequelize_1 = require("sequelize");
const DiamondBid_1 = require("../models/DiamondBid");
const UserBid_1 = require("../models/UserBid");
const Result_1 = require("../models/Result");
const BidHistory_1 = require("../models/BidHistory");
const bidStatus_1 = require("../utils/bidStatus");
const params_1 = require("../utils/params");
const declareResultIfClosed = async (diamondBid) => {
    await (0, bidStatus_1.refreshBidStatus)(diamondBid);
    const now = new Date();
    if (now <= diamondBid.endDateTime || diamondBid.resultDeclared) {
        return null;
    }
    const bids = await UserBid_1.UserBid.findAll({
        where: { diamondBidId: diamondBid.id },
        order: [
            ["currentBidAmount", "DESC"],
            ["createdAt", "ASC"],
        ],
        limit: 1,
    });
    const highestBid = bids[0];
    if (!highestBid) {
        return null;
    }
    diamondBid.winnerId = highestBid.userId;
    diamondBid.resultDeclared = true;
    diamondBid.declaredAt = new Date();
    await diamondBid.save();
    await Result_1.Result.create({
        diamondBidId: diamondBid.id,
        winnerId: highestBid.userId,
        winningAmount: Number(highestBid.currentBidAmount),
        declaredAt: new Date(),
    });
    return diamondBid;
};
exports.declareResultIfClosed = declareResultIfClosed;
const getAllBidsForDiamond = async (req, res) => {
    var _a;
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(diamondBid);
        const bids = await UserBid_1.UserBid.findAll({
            where: { diamondBidId: diamondBid.id },
            order: [["currentBidAmount", "DESC"]],
        });
        const highestBid = (_a = bids[0]) !== null && _a !== void 0 ? _a : null;
        return res.json({
            diamondBid,
            bids,
            highestBid,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch bids for diamond" });
    }
};
exports.getAllBidsForDiamond = getAllBidsForDiamond;
/** Admin: full bid history for a diamond (every bid/update in chronological order) */
const getBidHistoryForDiamond = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        const history = await BidHistory_1.BidHistory.findAll({
            where: { diamondBidId: id },
            include: [{ association: "user", attributes: ["id", "email"] }],
            order: [["editedAt", "ASC"]],
        });
        return res.json({ history });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch bid history" });
    }
};
exports.getBidHistoryForDiamond = getBidHistoryForDiamond;
const declareResult = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(diamondBid);
        const now = new Date();
        if (now <= diamondBid.endDateTime) {
            return res.status(400).json({ message: "Cannot declare result before bid end time" });
        }
        if (diamondBid.resultDeclared) {
            return res.status(400).json({ message: "Result has already been declared for this bid" });
        }
        const bids = await UserBid_1.UserBid.findAll({
            where: { diamondBidId: diamondBid.id },
            order: [["currentBidAmount", "DESC"], ["createdAt", "ASC"]],
            limit: 1,
        });
        const highestBid = bids[0];
        if (!highestBid) {
            return res.status(400).json({ message: "No bids to declare a winner" });
        }
        diamondBid.winnerId = highestBid.userId;
        diamondBid.resultDeclared = true;
        diamondBid.declaredAt = new Date();
        await diamondBid.save();
        await Result_1.Result.create({
            diamondBidId: diamondBid.id,
            winnerId: highestBid.userId,
            winningAmount: Number(highestBid.currentBidAmount),
            declaredAt: new Date(),
        });
        return res.json({
            message: "Result declared successfully",
            diamondBid,
            winningBid: highestBid,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to declare result" });
    }
};
exports.declareResult = declareResult;
const listAllResults = async (req, res) => {
    try {
        const results = await Result_1.Result.findAll({
            include: [
                {
                    association: "diamondBid",
                    attributes: ["id", "diamondName", "diamondId", "diamondImageUrl", "endDateTime"],
                },
                { association: "winner", attributes: ["id", "email"] },
            ],
            order: [["declaredAt", "DESC"]],
        });
        return res.json({ results });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch results" });
    }
};
exports.listAllResults = listAllResults;
const getMyResults = async (req, res) => {
    try {
        const userId = req.user.id;
        const userBids = await UserBid_1.UserBid.findAll({
            where: { userId },
        });
        const diamondBidIds = Array.from(new Set(userBids.map((b) => b.diamondBidId)));
        if (diamondBidIds.length === 0) {
            return res.json({ results: [] });
        }
        const diamondBids = await DiamondBid_1.DiamondBid.findAll({
            where: { id: { [sequelize_1.Op.in]: diamondBidIds } },
            order: [["endDateTime", "DESC"]],
        });
        for (const bid of diamondBids) {
            await (0, exports.declareResultIfClosed)(bid);
        }
        const declaredBids = await DiamondBid_1.DiamondBid.findAll({
            where: {
                id: { [sequelize_1.Op.in]: diamondBidIds },
                resultDeclared: true,
            },
            order: [["endDateTime", "DESC"]],
        });
        const results = declaredBids.map((bid) => ({
            diamondBidId: bid.id,
            diamondName: bid.diamondName,
            diamondImageUrl: bid.diamondImageUrl,
            endDateTime: bid.endDateTime,
            resultDeclared: bid.resultDeclared,
            declaredAt: bid.declaredAt,
            winnerId: bid.winnerId,
            status: bid.winnerId === userId ? "win" : "lose",
        }));
        return res.json({ results });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch your results" });
    }
};
exports.getMyResults = getMyResults;
//# sourceMappingURL=resultController.js.map