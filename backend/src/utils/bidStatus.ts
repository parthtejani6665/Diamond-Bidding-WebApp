import { DiamondBid } from "../models/DiamondBid";

export type BidStatus = "draft" | "active" | "closed";

export const computeStatus = (start: Date, end: Date, now: Date = new Date()): BidStatus => {
  if (now < start) return "draft";
  if (now >= start && now <= end) return "active";
  return "closed";
};

export const refreshBidStatus = async (bid: DiamondBid): Promise<DiamondBid> => {
  const newStatus = computeStatus(bid.startDateTime, bid.endDateTime);
  if (bid.status !== newStatus) {
    bid.status = newStatus;
    await bid.save();
  }
  return bid;
};

