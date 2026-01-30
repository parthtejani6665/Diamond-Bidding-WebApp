"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvent = void 0;
exports.emitBidUpdate = emitBidUpdate;
exports.emitAutoBidUpdate = emitAutoBidUpdate;
const server_1 = require("../server");
var SocketEvent;
(function (SocketEvent) {
    SocketEvent["BID_UPDATE"] = "bidUpdate";
    SocketEvent["AUTO_BID_UPDATE"] = "autoBidUpdate";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
/**
 * Emits a bid update for a specific diamond bid.
 * @param diamondBidId The ID of the diamond bid that was updated.
 * @param data The updated bid data (e.g., highest bid, new bids list).
 */
function emitBidUpdate(diamondBidId, data) {
    server_1.io.to(`diamondBid:${diamondBidId}`).emit(SocketEvent.BID_UPDATE, data);
}
/**
 * Emits an auto-bid update for a specific diamond bid and user.
 * @param diamondBidId The ID of the diamond bid.
 * @param userId The ID of the user whose auto-bid was updated.
 * @param data The updated auto-bid data.
 */
function emitAutoBidUpdate(diamondBidId, userId, data) {
    server_1.io.to(`user:${userId}`).emit(SocketEvent.AUTO_BID_UPDATE, { diamondBidId, data });
}
//# sourceMappingURL=socketService.js.map