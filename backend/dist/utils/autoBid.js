"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAutoBids = processAutoBids;
const DiamondBid_1 = require("../models/DiamondBid");
const UserBid_1 = require("../models/UserBid");
const AutoBid_1 = require("../models/AutoBid");
const BidHistory_1 = require("../models/BidHistory");
const socketService_1 = require("../services/socketService");
const MAX_AUTO_BID_ROUNDS = 20;
/**
 * After a manual bid is placed or updated, process auto-bids: any user with an auto-bid
 * on this diamond who is now outbid will get an automatic bid placed (current_highest + increment),
 * capped at their maxAmount. Repeats until no more auto-bids fire or max rounds reached.
 */
async function processAutoBids(diamondBidId) {
    const diamondBid = await DiamondBid_1.DiamondBid.findByPk(diamondBidId);
    if (!diamondBid)
        return;
    const baseBidPrice = Number(diamondBid.baseBidPrice);
    for (let round = 0; round < MAX_AUTO_BID_ROUNDS; round++) {
        const allBids = await UserBid_1.UserBid.findAll({
            where: { diamondBidId },
            order: [["currentBidAmount", "DESC"], ["createdAt", "ASC"]],
        });
        const currentHighest = allBids[0];
        if (!currentHighest)
            break;
        const highestAmount = Number(currentHighest.currentBidAmount);
        const autoBids = await AutoBid_1.AutoBid.findAll({ where: { diamondBidId } });
        let anyPlaced = false;
        for (const autoBid of autoBids) {
            if (autoBid.userId === currentHighest.userId)
                continue;
            const maxAmount = Number(autoBid.maxAmount);
            const incrementAmount = Number(autoBid.incrementAmount);
            if (maxAmount <= highestAmount)
                continue;
            const userBid = allBids.find((b) => b.userId === autoBid.userId);
            const userCurrentAmount = userBid ? Number(userBid.currentBidAmount) : 0;
            if (userCurrentAmount >= highestAmount)
                continue;
            const newAmount = Math.min(highestAmount + incrementAmount, maxAmount);
            if (newAmount <= userCurrentAmount)
                continue;
            if (newAmount < baseBidPrice)
                continue;
            if (userBid) {
                userBid.currentBidAmount = newAmount;
                await userBid.save();
            }
            else {
                const created = await UserBid_1.UserBid.create({
                    userId: autoBid.userId,
                    diamondBidId,
                    currentBidAmount: newAmount,
                });
                await BidHistory_1.BidHistory.create({
                    userBidId: created.id,
                    userId: autoBid.userId,
                    diamondBidId,
                    bidAmount: newAmount,
                });
                (0, socketService_1.emitBidUpdate)(diamondBidId, { action: "auto_placed", bid: created });
                anyPlaced = true;
                break;
            }
            await BidHistory_1.BidHistory.create({
                userBidId: userBid.id,
                userId: autoBid.userId,
                diamondBidId,
                bidAmount: newAmount,
            });
            (0, socketService_1.emitBidUpdate)(diamondBidId, { action: "auto_updated", bid: userBid });
            anyPlaced = true;
            break;
        }
        if (!anyPlaced)
            break;
    }
}
//# sourceMappingURL=autoBid.js.map