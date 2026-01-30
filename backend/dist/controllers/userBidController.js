"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAutoBid = exports.setAutoBid = exports.getAutoBid = exports.listMyBids = exports.getBidHistory = exports.updateBid = exports.placeBid = exports.listActiveDiamondBids = void 0;
const sequelize_1 = require("sequelize");
const DiamondBid_1 = require("../models/DiamondBid");
const UserBid_1 = require("../models/UserBid");
const BidHistory_1 = require("../models/BidHistory");
const AutoBid_1 = require("../models/AutoBid");
const bidStatus_1 = require("../utils/bidStatus");
const params_1 = require("../utils/params");
const autoBid_1 = require("../utils/autoBid");
const socketService_1 = require("../services/socketService");
// GET /api/bids/active - list active diamond bids for users (with myAutoBid, myCurrentBid, and highestBid if set)
const listActiveDiamondBids = async (req, res) => {
    var _a;
    try {
        const now = new Date();
        const diamondBids = await DiamondBid_1.DiamondBid.findAll({
            where: {
                startDateTime: { [sequelize_1.Op.lte]: now },
                endDateTime: { [sequelize_1.Op.gte]: now },
            },
            order: [["startDateTime", "ASC"]],
        });
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const results = await Promise.all(diamondBids.map(async (diamondBid) => {
            await (0, bidStatus_1.refreshBidStatus)(diamondBid);
            let myCurrentBid = null;
            let highestBid = null;
            let myAutoBid = null;
            if (userId) {
                myCurrentBid = await UserBid_1.UserBid.findOne({
                    where: { userId, diamondBidId: diamondBid.id },
                });
                myAutoBid = await AutoBid_1.AutoBid.findOne({
                    where: { userId, diamondBidId: diamondBid.id },
                });
            }
            const allBids = await UserBid_1.UserBid.findAll({
                where: { diamondBidId: diamondBid.id },
                order: [["currentBidAmount", "DESC"], ["createdAt", "ASC"]],
                limit: 1,
            });
            highestBid = allBids[0] || null;
            return {
                ...diamondBid.toJSON(),
                myCurrentBid,
                highestBid,
                myAutoBid,
            };
        }));
        return res.json({ bids: results });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch active bids" });
    }
};
exports.listActiveDiamondBids = listActiveDiamondBids;
// POST /api/bids/:diamondBidId - place initial bid
const placeBid = async (req, res) => {
    try {
        const diamondBidId = (0, params_1.parseIdParam)(req.params.diamondBidId);
        if (!diamondBidId) {
            return res.status(400).json({ message: "Invalid diamondBidId" });
        }
        const { amount } = req.body;
        if (amount == null) {
            return res.status(400).json({ message: "Bid amount is required" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(diamondBidId);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(diamondBid);
        const now = new Date();
        if (diamondBid.status !== "active" || now < diamondBid.startDateTime || now > diamondBid.endDateTime) {
            return res.status(400).json({ message: "Bidding is not active for this diamond" });
        }
        if (Number(amount) < Number(diamondBid.baseBidPrice)) {
            return res
                .status(400)
                .json({ message: "Bid amount must be greater than or equal to base bid price" });
        }
        const userId = req.user.id;
        let userBid = await UserBid_1.UserBid.findOne({
            where: { userId, diamondBidId: diamondBid.id },
        });
        if (userBid) {
            return res.status(400).json({ message: "You already have a bid. Use update instead." });
        }
        userBid = await UserBid_1.UserBid.create({
            userId,
            diamondBidId: diamondBid.id,
            currentBidAmount: amount,
        });
        await BidHistory_1.BidHistory.create({
            userBidId: userBid.id,
            userId,
            diamondBidId: diamondBid.id,
            bidAmount: amount,
        });
        await (0, autoBid_1.processAutoBids)(diamondBid.id).catch((err) => console.error("processAutoBids:", err));
        // Emit a bid update event to all clients in the diamond bid room
        (0, socketService_1.emitBidUpdate)(diamondBid.id, { action: "placed", bid: userBid });
        return res.status(201).json({ bid: userBid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to place bid" });
    }
};
exports.placeBid = placeBid;
// PUT /api/bids/:id - edit existing bid until end time
const updateBid = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const { amount } = req.body;
        if (amount == null) {
            return res.status(400).json({ message: "Bid amount is required" });
        }
        const userBid = await UserBid_1.UserBid.findByPk(id);
        if (!userBid) {
            return res.status(404).json({ message: "User bid not found" });
        }
        if (userBid.userId !== req.user.id) {
            return res.status(403).json({ message: "You can edit only your own bids" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(userBid.diamondBidId);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(diamondBid);
        const now = new Date();
        if (now > diamondBid.endDateTime || diamondBid.status !== "active") {
            return res.status(400).json({ message: "Bid window has closed" });
        }
        if (Number(amount) < Number(diamondBid.baseBidPrice)) {
            return res
                .status(400)
                .json({ message: "Bid amount must be greater than or equal to base bid price" });
        }
        userBid.currentBidAmount = amount;
        await userBid.save();
        await BidHistory_1.BidHistory.create({
            userBidId: userBid.id,
            userId: req.user.id,
            diamondBidId: diamondBid.id,
            bidAmount: amount,
        });
        await (0, autoBid_1.processAutoBids)(diamondBid.id).catch((err) => console.error("processAutoBids:", err));
        // Emit a bid update event to all clients in the diamond bid room
        (0, socketService_1.emitBidUpdate)(diamondBid.id, { action: "updated", bid: userBid });
        return res.json({ bid: userBid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update bid" });
    }
};
exports.updateBid = updateBid;
// GET /api/bids/:id/history - full edit history for one bid
const getBidHistory = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const userBid = await UserBid_1.UserBid.findByPk(id);
        if (!userBid) {
            return res.status(404).json({ message: "User bid not found" });
        }
        // Both owner and admin will be allowed to see in future; for now allow owner only
        if (userBid.userId !== req.user.id) {
            return res.status(403).json({ message: "You can view only your own bid history" });
        }
        const history = await BidHistory_1.BidHistory.findAll({
            where: { userBidId: userBid.id },
            order: [["editedAt", "ASC"]],
        });
        return res.json({ history });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch bid history" });
    }
};
exports.getBidHistory = getBidHistory;
// GET /api/bids/my-bids - all bids for current user (with diamond + autoBid if set)
const listMyBids = async (req, res) => {
    try {
        const bids = await UserBid_1.UserBid.findAll({
            where: { userId: req.user.id },
            include: [{ model: DiamondBid_1.DiamondBid, as: "diamondBid" }],
            order: [["createdAt", "DESC"]],
        });
        const bidsWithAuto = await Promise.all(bids.map(async (b) => {
            const autoBid = await AutoBid_1.AutoBid.findOne({
                where: { userId: b.userId, diamondBidId: b.diamondBidId },
            });
            return { ...b.toJSON(), autoBid: autoBid !== null && autoBid !== void 0 ? autoBid : null };
        }));
        return res.json({ bids: bidsWithAuto });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch your bids" });
    }
};
exports.listMyBids = listMyBids;
// GET /api/bids/:diamondBidId/auto-bid - get my auto-bid for this diamond (null if not set)
const getAutoBid = async (req, res) => {
    try {
        const diamondBidId = (0, params_1.parseIdParam)(req.params.diamondBidId);
        if (!diamondBidId) {
            return res.status(400).json({ message: "Invalid diamondBidId" });
        }
        const autoBid = await AutoBid_1.AutoBid.findOne({
            where: { userId: req.user.id, diamondBidId },
        });
        return res.json({ autoBid: autoBid !== null && autoBid !== void 0 ? autoBid : null });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch auto-bid" });
    }
};
exports.getAutoBid = getAutoBid;
// POST /api/bids/:diamondBidId/auto-bid - set or update auto-bid (maxAmount, incrementAmount)
const setAutoBid = async (req, res) => {
    try {
        const diamondBidId = (0, params_1.parseIdParam)(req.params.diamondBidId);
        if (!diamondBidId) {
            return res.status(400).json({ message: "Invalid diamondBidId" });
        }
        const { maxAmount, incrementAmount } = req.body;
        if (maxAmount == null || incrementAmount == null) {
            return res.status(400).json({ message: "maxAmount and incrementAmount are required" });
        }
        const max = Number(maxAmount);
        const inc = Number(incrementAmount);
        if (max <= 0 || inc <= 0) {
            return res.status(400).json({ message: "maxAmount and incrementAmount must be positive" });
        }
        const diamondBid = await DiamondBid_1.DiamondBid.findByPk(diamondBidId);
        if (!diamondBid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(diamondBid);
        const now = new Date();
        if (diamondBid.status !== "active" || now < diamondBid.startDateTime || now > diamondBid.endDateTime) {
            return res.status(400).json({ message: "Bidding is not active for this diamond" });
        }
        if (max < Number(diamondBid.baseBidPrice)) {
            return res.status(400).json({ message: "maxAmount must be at least base bid price" });
        }
        const userId = req.user.id;
        const [autoBid] = await AutoBid_1.AutoBid.findOrCreate({
            where: { userId, diamondBidId },
            defaults: { userId, diamondBidId, maxAmount: max, incrementAmount: inc },
        });
        if (autoBid.maxAmount !== max || autoBid.incrementAmount !== inc) {
            autoBid.maxAmount = max;
            autoBid.incrementAmount = inc;
            await autoBid.save();
        }
        // Run auto-bid logic immediately so if user is currently outbid, their bid is placed/incremented
        await (0, autoBid_1.processAutoBids)(diamondBidId).catch((err) => console.error("processAutoBids on setAutoBid:", err));
        // Emit an auto-bid update event for this user
        (0, socketService_1.emitAutoBidUpdate)(diamondBidId, userId, { action: "set", autoBid });
        return res.json({ autoBid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to set auto-bid" });
    }
};
exports.setAutoBid = setAutoBid;
// DELETE /api/bids/:diamondBidId/auto-bid - remove auto-bid
const deleteAutoBid = async (req, res) => {
    try {
        const diamondBidId = (0, params_1.parseIdParam)(req.params.diamondBidId);
        if (!diamondBidId) {
            return res.status(400).json({ message: "Invalid diamondBidId" });
        }
        const deleted = await AutoBid_1.AutoBid.destroy({
            where: { userId: req.user.id, diamondBidId },
        });
        if (deleted === 0) {
            return res.status(404).json({ message: "No auto-bid set for this diamond" });
        }
        // Emit an auto-bid update event for this user
        (0, socketService_1.emitAutoBidUpdate)(diamondBidId, req.user.id, { action: "removed" });
        return res.json({ message: "Auto-bid removed" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to remove auto-bid" });
    }
};
exports.deleteAutoBid = deleteAutoBid;
//# sourceMappingURL=userBidController.js.map