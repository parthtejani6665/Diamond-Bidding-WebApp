import { DiamondBid } from "../models/DiamondBid";
import { UserBid } from "../models/UserBid";
import { AutoBid } from "../models/AutoBid";
import { BidHistory } from "../models/BidHistory";
import { emitBidUpdate } from "../services/socketService";

const MAX_AUTO_BID_ROUNDS = 20;

/**
 * After a manual bid is placed or updated, process auto-bids: any user with an auto-bid
 * on this diamond who is now outbid will get an automatic bid placed (current_highest + increment),
 * capped at their maxAmount. Repeats until no more auto-bids fire or max rounds reached.
 */
export async function processAutoBids(diamondBidId: number): Promise<void> {
  const diamondBid = await DiamondBid.findByPk(diamondBidId);
  if (!diamondBid) return;

  const baseBidPrice = Number(diamondBid.baseBidPrice);

  for (let round = 0; round < MAX_AUTO_BID_ROUNDS; round++) {
    const allBids = await UserBid.findAll({
      where: { diamondBidId },
      order: [["currentBidAmount", "DESC"], ["createdAt", "ASC"]],
    });

    const currentHighest = allBids[0];
    if (!currentHighest) break;

    const highestAmount = Number(currentHighest.currentBidAmount);
    const autoBids = await AutoBid.findAll({ where: { diamondBidId } });

    let anyPlaced = false;

    for (const autoBid of autoBids) {
      if (autoBid.userId === currentHighest.userId) continue;

      const maxAmount = Number(autoBid.maxAmount);
      const incrementAmount = Number(autoBid.incrementAmount);

      if (maxAmount <= highestAmount) continue;

      const userBid = allBids.find((b) => b.userId === autoBid.userId);
      const userCurrentAmount = userBid ? Number(userBid.currentBidAmount) : 0;

      if (userCurrentAmount >= highestAmount) continue;

      const newAmount = Math.min(
        highestAmount + incrementAmount,
        maxAmount
      );

      if (newAmount <= userCurrentAmount) continue;
      if (newAmount < baseBidPrice) continue;

      if (userBid) {
        userBid.currentBidAmount = newAmount;
        await userBid.save();
      } else {
        const created = await UserBid.create({
          userId: autoBid.userId,
          diamondBidId,
          currentBidAmount: newAmount,
        });
        await BidHistory.create({
          userBidId: created.id,
          userId: autoBid.userId,
          diamondBidId,
          bidAmount: newAmount,
        });
        emitBidUpdate(diamondBidId, { action: "auto_placed", bid: created });
        anyPlaced = true;
        break;
      }

      await BidHistory.create({
        userBidId: userBid.id,
        userId: autoBid.userId,
        diamondBidId,
        bidAmount: newAmount,
      });
      emitBidUpdate(diamondBidId, { action: "auto_updated", bid: userBid });

      anyPlaced = true;
      break;
    }

    if (!anyPlaced) break;
  }
}
