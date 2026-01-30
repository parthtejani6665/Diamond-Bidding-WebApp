import { Request, Response } from "express";
import { DiamondBid } from "../models/DiamondBid";
import { AuthRequest } from "../middleware/auth";
import { refreshBidStatus, computeStatus } from "../utils/bidStatus";
import { parseIdParam } from "../utils/params";
import { declareResultIfClosed } from "./resultController";

export const createDiamondBid = async (req: AuthRequest, res: Response) => {
  try {
    const {
      diamondName,
      diamondId,
      baseDiamondPrice,
      baseBidPrice,
      startDateTime,
      endDateTime,
    } = req.body as {
      diamondName: string;
      diamondId: string;
      baseDiamondPrice: number;
      baseBidPrice: number;
      startDateTime: string;
      endDateTime: string;
    };

    if (
      !diamondName ||
      !diamondId ||
      baseDiamondPrice == null ||
      baseBidPrice == null ||
      !startDateTime ||
      !endDateTime
    ) {
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

    const createdBy = req.user!.id;
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    const diamondImageUrl = file ? `/uploads/diamonds/${file.filename}` : null;

    const bid = await DiamondBid.create({
      diamondName,
      diamondId,
      diamondImageUrl,
      baseDiamondPrice,
      baseBidPrice,
      startDateTime: start,
      endDateTime: end,
      createdBy,
      status: computeStatus(start, end),
    });

    return res.status(201).json({ bid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create diamond bid" });
  }
};

export const listDiamondBids = async (_req: AuthRequest, res: Response) => {
  try {
    const bids = await DiamondBid.findAll({
      order: [["createdAt", "DESC"]],
    });

    const refreshed = await Promise.all(bids.map((b) => refreshBidStatus(b)));
    for (const b of refreshed) {
      if (b.status === "closed" && !b.resultDeclared) {
        await declareResultIfClosed(b);
      }
    }
    return res.json({ bids: refreshed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch diamond bids" });
  }
};

export const getDiamondBidById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const bid = await DiamondBid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    await refreshBidStatus(bid);
    return res.json({ bid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch diamond bid" });
  }
};

export const updateDiamondBid = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const bid = await DiamondBid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    await refreshBidStatus(bid);
    if (bid.status !== "draft") {
      return res.status(400).json({ message: "Only draft bids can be edited" });
    }
    const {
      diamondName,
      diamondId,
      baseDiamondPrice,
      baseBidPrice,
      startDateTime,
      endDateTime,
    } = req.body as Record<string, unknown>;
    if (diamondName) bid.diamondName = diamondName as string;
    if (diamondId) bid.diamondId = diamondId as string;
    if (baseDiamondPrice != null) bid.baseDiamondPrice = baseDiamondPrice as number;
    if (baseBidPrice != null) bid.baseBidPrice = baseBidPrice as number;
    if (startDateTime) bid.startDateTime = new Date(startDateTime as string);
    if (endDateTime) bid.endDateTime = new Date(endDateTime as string);
    bid.status = computeStatus(bid.startDateTime, bid.endDateTime);
    await bid.save();
    return res.json({ bid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update diamond bid" });
  }
};

export const deleteDiamondBid = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const bid = await DiamondBid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: "Diamond bid not found" });
    }
    await refreshBidStatus(bid);
    if (bid.status !== "draft") {
      return res.status(400).json({ message: "Only draft bids can be deleted" });
    }
    await bid.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete diamond bid" });
  }
};
