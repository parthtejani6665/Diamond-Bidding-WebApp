import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/auth";
import { DiamondBid } from "../models/DiamondBid";
import { UserBid } from "../models/UserBid";
import { BidHistory } from "../models/BidHistory";
import { AutoBid } from "../models/AutoBid";
import { refreshBidStatus } from "../utils/bidStatus";
import { parseIdParam } from "../utils/params";
import { processAutoBids } from "../utils/autoBid";
import { emitBidUpdate, emitAutoBidUpdate } from "../services/socketService";

// GET /api/bids/active - list active diamond bids for users (with myAutoBid, myCurrentBid, and highestBid if set)
export const listActiveDiamondBids = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const diamondBids = await DiamondBid.findAll({
      where: {
        startDateTime: { [Op.lte]: now },
        endDateTime: { [Op.gte]: now },
      },
      order: [["startDateTime", "ASC"]],
    });

    const userId = req.user?.id;

    const results = await Promise.all(
      diamondBids.map(async (diamondBid) => {
        await refreshBidStatus(diamondBid);

        let myCurrentBid: UserBid | null = null;
        let highestBid: UserBid | null = null;
        let myAutoBid: AutoBid | null = null;

        if (userId) {
          myCurrentBid = await UserBid.findOne({
            where: { userId, diamondBidId: diamondBid.id },
          });
          myAutoBid = await AutoBid.findOne({
            where: { userId, diamondBidId: diamondBid.id },
          });
        }

        const allBids = await UserBid.findAll({
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
      })
    );

    return res.json({ bids: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch active bids" });
  }
};

// POST /api/bids/:diamondBidId - place initial bid
export const placeBid = async (req: AuthRequest, res: Response) => {
  try {
    const diamondBidId = parseIdParam((req.params as { diamondBidId?: unknown }).diamondBidId);
    if (!diamondBidId) {
      return res.status(400).json({ message: "Invalid diamondBidId" });
    }
    const { amount } = req.body as { amount: number };

    if (amount == null) {
      return res.status(400).json({ message: "Bid amount is required" });
    }

    const diamondBid = await DiamondBid.findByPk(diamondBidId);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }

    await refreshBidStatus(diamondBid);
    const now = new Date();

    if (diamondBid.status !== "active" || now < diamondBid.startDateTime || now > diamondBid.endDateTime) {
      return res.status(400).json({ message: "Bidding is not active for this diamond" });
    }

    if (Number(amount) < Number(diamondBid.baseBidPrice)) {
      return res
        .status(400)
        .json({ message: "Bid amount must be greater than or equal to base bid price" });
    }

    const userId = req.user!.id;

    let userBid = await UserBid.findOne({
      where: { userId, diamondBidId: diamondBid.id },
    });

    if (userBid) {
      return res.status(400).json({ message: "You already have a bid. Use update instead." });
    }

    userBid = await UserBid.create({
      userId,
      diamondBidId: diamondBid.id,
      currentBidAmount: amount,
    });

    await BidHistory.create({
      userBidId: userBid.id,
      userId,
      diamondBidId: diamondBid.id,
      bidAmount: amount,
    });

    await processAutoBids(diamondBid.id).catch((err) => console.error("processAutoBids:", err));

    // Emit a bid update event to all clients in the diamond bid room
    emitBidUpdate(diamondBid.id, { action: "placed", bid: userBid });

    return res.status(201).json({ bid: userBid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to place bid" });
  }
};

// PUT /api/bids/:id - edit existing bid until end time
export const updateBid = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { amount } = req.body as { amount: number };

    if (amount == null) {
      return res.status(400).json({ message: "Bid amount is required" });
    }

    const userBid = await UserBid.findByPk(id);
    if (!userBid) {
      return res.status(404).json({ message: "User bid not found" });
    }

    if (userBid.userId !== req.user!.id) {
      return res.status(403).json({ message: "You can edit only your own bids" });
    }

    const diamondBid = await DiamondBid.findByPk(userBid.diamondBidId);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }

    await refreshBidStatus(diamondBid);
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

    await BidHistory.create({
      userBidId: userBid.id,
      userId: req.user!.id,
      diamondBidId: diamondBid.id,
      bidAmount: amount,
    });

    await processAutoBids(diamondBid.id).catch((err) => console.error("processAutoBids:", err));

    // Emit a bid update event to all clients in the diamond bid room
    emitBidUpdate(diamondBid.id, { action: "updated", bid: userBid });

    return res.json({ bid: userBid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update bid" });
  }
};

// GET /api/bids/:id/history - full edit history for one bid
export const getBidHistory = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const userBid = await UserBid.findByPk(id);
    if (!userBid) {
      return res.status(404).json({ message: "User bid not found" });
    }

    // Both owner and admin will be allowed to see in future; for now allow owner only
    if (userBid.userId !== req.user!.id) {
      return res.status(403).json({ message: "You can view only your own bid history" });
    }

    const history = await BidHistory.findAll({
      where: { userBidId: userBid.id },
      order: [["editedAt", "ASC"]],
    });

    return res.json({ history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch bid history" });
  }
};

// GET /api/bids/my-bids - all bids for current user (with diamond + autoBid if set)
export const listMyBids = async (req: AuthRequest, res: Response) => {
  try {
    const bids = await UserBid.findAll({
      where: { userId: req.user!.id },
      include: [{ model: DiamondBid, as: "diamondBid" }],
      order: [["createdAt", "DESC"]],
    });

    const bidsWithAuto = await Promise.all(
      bids.map(async (b) => {
        const autoBid = await AutoBid.findOne({
          where: { userId: b.userId, diamondBidId: b.diamondBidId },
        });
        return { ...b.toJSON(), autoBid: autoBid ?? null };
      })
    );

    return res.json({ bids: bidsWithAuto });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch your bids" });
  }
};

// GET /api/bids/:diamondBidId/auto-bid - get my auto-bid for this diamond (null if not set)
export const getAutoBid = async (req: AuthRequest, res: Response) => {
  try {
    const diamondBidId = parseIdParam((req.params as { diamondBidId?: unknown }).diamondBidId);
    if (!diamondBidId) {
      return res.status(400).json({ message: "Invalid diamondBidId" });
    }

    const autoBid = await AutoBid.findOne({
      where: { userId: req.user!.id, diamondBidId },
    });

    return res.json({ autoBid: autoBid ?? null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch auto-bid" });
  }
};

// POST /api/bids/:diamondBidId/auto-bid - set or update auto-bid (maxAmount, incrementAmount)
export const setAutoBid = async (req: AuthRequest, res: Response) => {
  try {
    const diamondBidId = parseIdParam((req.params as { diamondBidId?: unknown }).diamondBidId);
    if (!diamondBidId) {
      return res.status(400).json({ message: "Invalid diamondBidId" });
    }

    const { maxAmount, incrementAmount } = req.body as { maxAmount: number; incrementAmount: number };

    if (maxAmount == null || incrementAmount == null) {
      return res.status(400).json({ message: "maxAmount and incrementAmount are required" });
    }

    const max = Number(maxAmount);
    const inc = Number(incrementAmount);

    if (max <= 0 || inc <= 0) {
      return res.status(400).json({ message: "maxAmount and incrementAmount must be positive" });
    }

    const diamondBid = await DiamondBid.findByPk(diamondBidId);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }

    await refreshBidStatus(diamondBid);
    const now = new Date();
    if (diamondBid.status !== "active" || now < diamondBid.startDateTime || now > diamondBid.endDateTime) {
      return res.status(400).json({ message: "Bidding is not active for this diamond" });
    }

    if (max < Number(diamondBid.baseBidPrice)) {
      return res.status(400).json({ message: "maxAmount must be at least base bid price" });
    }

    const userId = req.user!.id;

    const [autoBid] = await AutoBid.findOrCreate({
      where: { userId, diamondBidId },
      defaults: { userId, diamondBidId, maxAmount: max, incrementAmount: inc },
    });

    if (autoBid.maxAmount !== max || autoBid.incrementAmount !== inc) {
      autoBid.maxAmount = max;
      autoBid.incrementAmount = inc;
      await autoBid.save();
    }

    // Run auto-bid logic immediately so if user is currently outbid, their bid is placed/incremented
    await processAutoBids(diamondBidId).catch((err) => console.error("processAutoBids on setAutoBid:", err));

    // Emit an auto-bid update event for this user
    emitAutoBidUpdate(diamondBidId, userId, { action: "set", autoBid });

    return res.json({ autoBid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to set auto-bid" });
  }
};

// DELETE /api/bids/:diamondBidId/auto-bid - remove auto-bid
export const deleteAutoBid = async (req: AuthRequest, res: Response) => {
  try {
    const diamondBidId = parseIdParam((req.params as { diamondBidId?: unknown }).diamondBidId);
    if (!diamondBidId) {
      return res.status(400).json({ message: "Invalid diamondBidId" });
    }

    const deleted = await AutoBid.destroy({
      where: { userId: req.user!.id, diamondBidId },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "No auto-bid set for this diamond" });
    }

    // Emit an auto-bid update event for this user
    emitAutoBidUpdate(diamondBidId, req.user!.id, { action: "removed" });

    return res.json({ message: "Auto-bid removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove auto-bid" });
  }
};

