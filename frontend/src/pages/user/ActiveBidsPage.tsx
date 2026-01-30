import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";
import { useSocket } from "../../context/SocketContext";

interface AutoBidInfo {
  id: number;
  maxAmount: string | number;
  incrementAmount: string | number;
}

interface DiamondBid {
  id: number;
  diamondName: string;
  diamondId: string;
  diamondImageUrl?: string | null;
  baseBidPrice: string | number;
  startDateTime: string;
  endDateTime: string;
  status: "draft" | "active" | "closed";
  myAutoBid?: AutoBidInfo | null;
}

const ActiveBidsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [bids, setBids] = useState<DiamondBid[]>([]);
  const [amountByBid, setAmountByBid] = useState<Record<number, string>>({});
  const [autoMaxByBid, setAutoMaxByBid] = useState<Record<number, string>>({});
  const [autoIncrementByBid, setAutoIncrementByBid] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ bids: DiamondBid[] }>("/bids/active", {
        method: "GET",
        authToken: token,
      });
      setBids(data.bids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load active bids");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  // Effect for managing global Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = () => {
      void load();
    };

    const handleAutoBidUpdate = () => {
      void load();
    };

    socket.on("bidUpdate", handleBidUpdate);
    socket.on("autoBidUpdate", handleAutoBidUpdate);

    return () => {
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("autoBidUpdate", handleAutoBidUpdate);
    };
  }, [socket, load]);

  // Effect for managing joining/leaving diamond bid rooms
  const joinedRoomsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const currentBidIds = new Set(bids.map((b) => b.id));

    // Leave rooms that are no longer in the bids list
    Array.from(joinedRoomsRef.current).forEach((id) => {
      if (!currentBidIds.has(id)) {
        socket.emit("leaveDiamondBidRoom", id);
        joinedRoomsRef.current.delete(id);
      }
    });

    // Join rooms for new bids
    currentBidIds.forEach((id) => {
      if (!joinedRoomsRef.current.has(id)) {
        socket.emit("joinDiamondBidRoom", id);
        joinedRoomsRef.current.add(id);
      }
    });

    return () => {
      // Leave all rooms when component unmounts
      joinedRoomsRef.current.forEach((id) => {
        socket.emit("leaveDiamondBidRoom", id);
      });
      joinedRoomsRef.current.clear();
    };
  }, [socket, bids]);

  const place = async (diamondBidId: number, myCurrentBidId: number | undefined) => {
    setError(null);
    const amount = Number(amountByBid[diamondBidId] || 0);

    if (amount <= 0) {
      setError("Bid amount must be positive");
      return;
    }

    try {
      if (myCurrentBidId) {
        // User already has a bid, so update it
        await apiFetch(`/bids/${myCurrentBidId}`, {
          method: "PUT",
          authToken: token,
          body: JSON.stringify({ amount }),
        });
      } else {
        // No existing bid, so place a new one
        await apiFetch(`/bids/${diamondBidId}`, {
          method: "POST",
          authToken: token,
          body: JSON.stringify({ amount }),
        });
      }
      setAmountByBid((prev) => ({ ...prev, [diamondBidId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
    }
  };

  const setAutoBid = async (diamondBidId: number) => {
    setError(null);
    const maxAmount = Number(autoMaxByBid[diamondBidId] || 0);
    const incrementAmount = Number(autoIncrementByBid[diamondBidId] || 0);
    if (maxAmount <= 0 || incrementAmount <= 0) {
      setError("Max amount and increment must be positive");
      return;
    }
    try {
      await apiFetch(`/bids/${diamondBidId}/auto-bid`, {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ maxAmount, incrementAmount }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set auto-bid");
    }
  };

  const cancelAutoBid = async (diamondBidId: number) => {
    setError(null);
    try {
      await apiFetch(`/bids/${diamondBidId}/auto-bid`, {
        method: "DELETE",
        authToken: token,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel auto-bid");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Diamond Bids</h2>
          <button
            onClick={load}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : bids.length === 0 ? (
          <p className="text-sm text-slate-400">No active bids right now.</p>
        ) : (
          <div className="space-y-3">
            {bids.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {b.diamondImageUrl ? (
                      <img
                        src={getUploadUrl(b.diamondImageUrl)}
                        alt={b.diamondName}
                        className="h-16 w-16 rounded-lg object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                        No image
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{b.diamondName}</div>
                      <div className="text-xs text-slate-400">{b.diamondId}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Base Bid: <span className="text-slate-200">{String(b.baseBidPrice)}</span>
                      </div>
                      {b.highestBid && (
                        <div className="text-xs text-slate-400 mt-1">
                          Highest Bid: <span className="text-emerald-300">{String(b.highestBid.currentBidAmount)}</span>
                          {b.highestBid.userId === user?.id && <span className="text-emerald-500"> (You)</span>}
                        </div>
                      )}
                      {b.myCurrentBid && b.myCurrentBid.userId === user?.id && (
                        <div className="text-xs text-slate-400 mt-1">
                          Your Bid: <span className="text-blue-300">{String(b.myCurrentBid.currentBidAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className="w-40 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                      placeholder={b.highestBid ? `Min ${Number(b.highestBid.currentBidAmount) + 1}` : `Min ${Number(b.baseBidPrice)}`}
                      value={amountByBid[b.id] || ""}
                      onChange={(e) =>
                        setAmountByBid((prev) => ({ ...prev, [b.id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => void place(b.id, b.myCurrentBid?.id)}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      {b.myCurrentBid ? "Update" : "Place"}
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-xs font-medium text-slate-400 mb-2">Auto-bid (optional)</div>
                  {b.myAutoBid ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-200">
                        Till {String(b.myAutoBid.maxAmount)}, +{String(b.myAutoBid.incrementAmount)} when outbid
                      </span>
                      <button
                        onClick={() => void cancelAutoBid(b.id)}
                        className="rounded-lg border border-red-700 px-3 py-1 text-xs text-red-300 hover:bg-red-900/30"
                      >
                        Cancel auto-bid
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={0}
                        className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
                        placeholder="Max (e.g. 10000)"
                        value={autoMaxByBid[b.id] || ""}
                        onChange={(e) =>
                          setAutoMaxByBid((prev) => ({ ...prev, [b.id]: e.target.value }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
                        placeholder="Increment"
                        value={autoIncrementByBid[b.id] || ""}
                        onChange={(e) =>
                          setAutoIncrementByBid((prev) => ({ ...prev, [b.id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => void setAutoBid(b.id)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800 text-slate-200"
                      >
                        Set auto-bid
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {new Date(b.startDateTime).toLocaleString()} → {new Date(b.endDateTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>
    </div>
  );
};

export default ActiveBidsPage;
