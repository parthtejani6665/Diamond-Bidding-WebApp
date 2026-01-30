"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshBidStatus = exports.computeStatus = void 0;
const computeStatus = (start, end, now = new Date()) => {
    if (now < start)
        return "draft";
    if (now >= start && now <= end)
        return "active";
    return "closed";
};
exports.computeStatus = computeStatus;
const refreshBidStatus = async (bid) => {
    const newStatus = (0, exports.computeStatus)(bid.startDateTime, bid.endDateTime);
    if (bid.status !== newStatus) {
        bid.status = newStatus;
        await bid.save();
    }
    return bid;
};
exports.refreshBidStatus = refreshBidStatus;
//# sourceMappingURL=bidStatus.js.map