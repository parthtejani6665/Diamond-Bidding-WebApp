/**
 * After a manual bid is placed or updated, process auto-bids: any user with an auto-bid
 * on this diamond who is now outbid will get an automatic bid placed (current_highest + increment),
 * capped at their maxAmount. Repeats until no more auto-bids fire or max rounds reached.
 */
export declare function processAutoBids(diamondBidId: number): Promise<void>;
//# sourceMappingURL=autoBid.d.ts.map