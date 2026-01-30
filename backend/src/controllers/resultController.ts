import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/auth";
import { DiamondBid } from "../models/DiamondBid";
import { UserBid } from "../models/UserBid";
import { Result } from "../models/Result";
import { BidHistory } from "../models/BidHistory";
import { refreshBidStatus } from "../utils/bidStatus";
import { parseIdParam } from "../utils/params";

export const declareResultIfClosed = async (diamondBid: DiamondBid): Promise<DiamondBid | null> => {
  await refreshBidStatus(diamondBid);
  const now = new Date();
  if (now <= diamondBid.endDateTime || diamondBid.resultDeclared) {
    return null;
  }
  const bids = await UserBid.findAll({
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
  await Result.create({
    diamondBidId: diamondBid.id,
    winnerId: highestBid.userId,
    winningAmount: Number(highestBid.currentBidAmount),
    declaredAt: new Date(),
  });
  return diamondBid;
};

export const getAllBidsForDiamond = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const diamondBid = await DiamondBid.findByPk(id);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    await refreshBidStatus(diamondBid);
    const bids = await UserBid.findAll({
      where: { diamondBidId: diamondBid.id },
      order: [["currentBidAmount", "DESC"]],
    });
    const highestBid = bids[0] ?? null;
    return res.json({
      diamondBid,
      bids,
      highestBid,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch bids for diamond" });
  }
};

/** Admin: full bid history for a diamond (every bid/update in chronological order) */
export const getBidHistoryForDiamond = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const diamondBid = await DiamondBid.findByPk(id);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    const history = await BidHistory.findAll({
      where: { diamondBidId: id },
      include: [{ association: "user", attributes: ["id", "email"] }],
      order: [["editedAt", "ASC"]],
    });
    return res.json({ history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch bid history" });
  }
};

export const declareResult = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const diamondBid = await DiamondBid.findByPk(id);
    if (!diamondBid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    await refreshBidStatus(diamondBid);
    const now = new Date();
    if (now <= diamondBid.endDateTime) {
      return res.status(400).json({ message: "Cannot declare result before bid end time" });
    }
    if (diamondBid.resultDeclared) {
      return res.status(400).json({ message: "Result has already been declared for this bid" });
    }
    const bids = await UserBid.findAll({
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
    await Result.create({
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to declare result" });
  }
};

export const listAllResults = async (req: AuthRequest, res: Response) => {
  try {
    const results = await Result.findAll({
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch results" });
  }
};

export const getMyResults = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userBids = await UserBid.findAll({
      where: { userId },
    });
    const diamondBidIds = Array.from(new Set(userBids.map((b) => b.diamondBidId)));
    if (diamondBidIds.length === 0) {
      return res.json({ results: [] });
    }
    const diamondBids = await DiamondBid.findAll({
      where: { id: { [Op.in]: diamondBidIds } },
      order: [["endDateTime", "DESC"]],
    });
    for (const bid of diamondBids) {
      await declareResultIfClosed(bid);
    }
    const declaredBids = await DiamondBid.findAll({
      where: {
        id: { [Op.in]: diamondBidIds },
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
      status: bid.winnerId === userId ? ("win" as const) : ("lose" as const),
    }));
    return res.json({ results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch your results" });
  }
};
