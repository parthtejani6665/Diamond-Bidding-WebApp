"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiamondBid = exports.updateDiamondBid = exports.getDiamondBidById = exports.listDiamondBids = exports.createDiamondBid = void 0;
const DiamondBid_1 = require("../models/DiamondBid");
const bidStatus_1 = require("../utils/bidStatus");
const params_1 = require("../utils/params");
const resultController_1 = require("./resultController");
const createDiamondBid = async (req, res) => {
    try {
        const { diamondName, diamondId, baseDiamondPrice, baseBidPrice, startDateTime, endDateTime, } = req.body;
        if (!diamondName ||
            !diamondId ||
            baseDiamondPrice == null ||
            baseBidPrice == null ||
            !startDateTime ||
            !endDateTime) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (end <= start) {
            return res.status(400).json({ message: "End time must be after start time" });
        }
        const createdBy = req.user.id;
        const file = req.file;
        const diamondImageUrl = file ? `/uploads/diamonds/${file.filename}` : null;
        const bid = await DiamondBid_1.DiamondBid.create({
            diamondName,
            diamondId,
            diamondImageUrl,
            baseDiamondPrice,
            baseBidPrice,
            startDateTime: start,
            endDateTime: end,
            createdBy,
            status: (0, bidStatus_1.computeStatus)(start, end),
        });
        return res.status(201).json({ bid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create diamond bid" });
    }
};
exports.createDiamondBid = createDiamondBid;
const listDiamondBids = async (_req, res) => {
    try {
        const bids = await DiamondBid_1.DiamondBid.findAll({
            order: [["createdAt", "DESC"]],
        });
        const refreshed = await Promise.all(bids.map((b) => (0, bidStatus_1.refreshBidStatus)(b)));
        for (const b of refreshed) {
            if (b.status === "closed" && !b.resultDeclared) {
                await (0, resultController_1.declareResultIfClosed)(b);
            }
        }
        return res.json({ bids: refreshed });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch diamond bids" });
    }
};
exports.listDiamondBids = listDiamondBids;
const getDiamondBidById = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const bid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!bid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(bid);
        return res.json({ bid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch diamond bid" });
    }
};
exports.getDiamondBidById = getDiamondBidById;
const updateDiamondBid = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const bid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!bid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(bid);
        if (bid.status !== "draft") {
            return res.status(400).json({ message: "Only draft bids can be edited" });
        }
        const { diamondName, diamondId, baseDiamondPrice, baseBidPrice, startDateTime, endDateTime, } = req.body;
        if (diamondName)
            bid.diamondName = diamondName;
        if (diamondId)
            bid.diamondId = diamondId;
        if (baseDiamondPrice != null)
            bid.baseDiamondPrice = baseDiamondPrice;
        if (baseBidPrice != null)
            bid.baseBidPrice = baseBidPrice;
        if (startDateTime)
            bid.startDateTime = new Date(startDateTime);
        if (endDateTime)
            bid.endDateTime = new Date(endDateTime);
        bid.status = (0, bidStatus_1.computeStatus)(bid.startDateTime, bid.endDateTime);
        await bid.save();
        return res.json({ bid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update diamond bid" });
    }
};
exports.updateDiamondBid = updateDiamondBid;
const deleteDiamondBid = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const bid = await DiamondBid_1.DiamondBid.findByPk(id);
        if (!bid) {
            return res.status(404).json({ message: "Diamond bid not found" });
        }
        await (0, bidStatus_1.refreshBidStatus)(bid);
        if (bid.status !== "draft") {
            return res.status(400).json({ message: "Only draft bids can be deleted" });
        }
        await bid.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete diamond bid" });
    }
};
exports.deleteDiamondBid = deleteDiamondBid;
//# sourceMappingURL=diamondBidController.js.map