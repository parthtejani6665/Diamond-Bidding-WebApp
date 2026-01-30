import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";

interface DiamondBidInfo {
  id: number;
  diamondName: string;
  diamondId: string;
  diamondImageUrl?: string | null;
}

interface AutoBidInfo {
  id: number;
  maxAmount: string | number;
  incrementAmount: string | number;
}

interface UserBid {
  id: number;
  userId: number;
  diamondBidId: number;
  currentBidAmount: string | number;
  createdAt: string;
  updatedAt: string;
  diamondBid?: DiamondBidInfo;
  autoBid?: AutoBidInfo | null;
}

interface BidHistoryItem {
  id: number;
  bidAmount: string | number;
  editedAt: string;
}

const MyBidsPage: React.FC = () => {
  const { token } = useAuth();
  const [bids, setBids] = useState<UserBid[]>([]);
  const [selectedBid, setSelectedBid] = useState<UserBid | null>(null);
  const [history, setHistory] = useState<BidHistoryItem[]>([]);
  const [editAmount, setEditAmount] = useState<string>("");
  const [autoMax, setAutoMax] = useState<string>("");
  const [autoIncrement, setAutoIncrement] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (): Promise<UserBid[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ bids: UserBid[] }>("/bids/my-bids", {
        method: "GET",
        authToken: token,
      });
      setBids(data.bids);
      return data.bids;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your bids");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (bidId: number) => {
    setError(null);
    try {
      const data = await apiFetch<{ history: BidHistoryItem[] }>(`/bids/${bidId}/history`, {
        method: "GET",
        authToken: token,
      });
      setHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = async (bid: UserBid) => {
    setSelectedBid(bid);
    setEditAmount(String(bid.currentBidAmount));
    setAutoMax(bid.autoBid ? String(bid.autoBid.maxAmount) : "");
    setAutoIncrement(bid.autoBid ? String(bid.autoBid.incrementAmount) : "");
    await loadHistory(bid.id);
  };

  const update = async () => {
    if (!selectedBid) return;
    setError(null);
    try {
      await apiFetch<{ bid: UserBid }>(`/bids/${selectedBid.id}`, {
        method: "PUT",
        authToken: token,
        body: JSON.stringify({ amount: Number(editAmount) }),
      });
      await load();
      await loadHistory(selectedBid.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bid");
    }
  };

  const setAutoBid = async () => {
    if (!selectedBid) return;
    setError(null);
    const maxAmount = Number(autoMax);
    const incrementAmount = Number(autoIncrement);
    if (maxAmount <= 0 || incrementAmount <= 0) {
      setError("Max amount and increment must be positive");
      return;
    }
    try {
      await apiFetch(`/bids/${selectedBid.diamondBidId}/auto-bid`, {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ maxAmount, incrementAmount }),
      });
      const prevId = selectedBid.id;
      const nextBids = await load();
      const updated = nextBids.find((b) => b.id === prevId);
      if (updated) setSelectedBid(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set auto-bid");
    }
  };

  const cancelAutoBid = async () => {
    if (!selectedBid) return;
    setError(null);
    try {
      await apiFetch(`/bids/${selectedBid.diamondBidId}/auto-bid`, {
        method: "DELETE",
        authToken: token,
      });
      const prevId = selectedBid.id;
      setAutoMax("");
      setAutoIncrement("");
      const nextBids = await load();
      const updated = nextBids.find((b) => b.id === prevId);
      if (updated) setSelectedBid(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel auto-bid");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Bids</h2>
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
          <p className="text-sm text-slate-400">You haven’t placed any bids yet.</p>
        ) : (
          <div className="space-y-2">
            {bids.map((b) => (
              <button
                key={b.id}
                onClick={() => void select(b)}
                className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${
                  selectedBid?.id === b.id
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-950 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {b.diamondBid?.diamondImageUrl ? (
                    <img
                      src={getUploadUrl(b.diamondBid.diamondImageUrl)}
                      alt={b.diamondBid.diamondName}
                      className="h-10 w-10 rounded object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                      —
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{b.diamondBid?.diamondName || `Bid #${b.id}`}</span>
                      <span className="text-slate-200">{String(b.currentBidAmount)}</span>
                    </div>
                    <div className="text-xs text-slate-500">{b.diamondBid?.diamondId || `DiamondBidId: ${b.diamondBidId}`}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Bid Details</h2>
        {!selectedBid ? (
          <p className="text-sm text-slate-400">Select a bid to view/edit and see history.</p>
        ) : (
          <div className="space-y-4">
            {selectedBid.diamondBid && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 flex items-center gap-4">
                {selectedBid.diamondBid.diamondImageUrl ? (
                  <img
                    src={getUploadUrl(selectedBid.diamondBid.diamondImageUrl)}
                    alt={selectedBid.diamondBid.diamondName}
                    className="h-20 w-20 rounded-lg object-cover border border-slate-700"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                    No image
                  </div>
                )}
                <div>
                  <div className="font-semibold">{selectedBid.diamondBid.diamondName}</div>
                  <div className="text-xs text-slate-400">{selectedBid.diamondBid.diamondId}</div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400">Current amount</div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0}
                  className="w-48 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
                <button
                  onClick={() => void update()}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Update
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Updates are allowed only until the bid end time; backend enforces this.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-sm text-slate-400 mb-2">Auto-bid</div>
              {selectedBid.autoBid ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-200">
                    Till {String(selectedBid.autoBid.maxAmount)}, +{String(selectedBid.autoBid.incrementAmount)} when outbid
                  </span>
                  <button
                    onClick={() => void cancelAutoBid()}
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
                    className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    placeholder="Max (e.g. 10000)"
                    value={autoMax}
                    onChange={(e) => setAutoMax(e.target.value)}
                  />
                  <input
                    type="number"
                    min={0}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    placeholder="Increment"
                    value={autoIncrement}
                    onChange={(e) => setAutoIncrement(e.target.value)}
                  />
                  <button
                    onClick={() => void setAutoBid()}
                    className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800 text-slate-200"
                  >
                    Set auto-bid
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                When someone outbids you, your bid will auto-increment by the amount above until the max.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">History</h3>
                <button
                  onClick={() => void loadHistory(selectedBid.id)}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-slate-400">No history entries.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center justify-between border-b border-slate-800 py-2">
                      <span className="font-medium">{String(h.bidAmount)}</span>
                      <span className="text-xs text-slate-500">{new Date(h.editedAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>
    </div>
  );
};

export default MyBidsPage;

