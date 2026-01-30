import { io } from "../server";

export enum SocketEvent {
  BID_UPDATE = "bidUpdate",
  AUTO_BID_UPDATE = "autoBidUpdate",
}

/**
 * Emits a bid update for a specific diamond bid.
 * @param diamondBidId The ID of the diamond bid that was updated.
 * @param data The updated bid data (e.g., highest bid, new bids list).
 */
export function emitBidUpdate(diamondBidId: number, data: any) {
  io.to(`diamondBid:${diamondBidId}`).emit(SocketEvent.BID_UPDATE, data);
}

/**
 * Emits an auto-bid update for a specific diamond bid and user.
 * @param diamondBidId The ID of the diamond bid.
 * @param userId The ID of the user whose auto-bid was updated.
 * @param data The updated auto-bid data.
 */
export function emitAutoBidUpdate(diamondBidId: number, userId: number, data: any) {
  io.to(`user:${userId}`).emit(SocketEvent.AUTO_BID_UPDATE, { diamondBidId, data });
}
