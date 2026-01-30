import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

interface DiamondBid {
  id: number;
  diamondName: string;
  diamondId: string;
  status: "draft" | "active" | "closed";
  endDateTime: string;
  resultDeclared: boolean;
  winnerId: number | null;
}

interface UserBid {
  id: number;
  userId: number;
  diamondBidId: number;
  currentBidAmount: string | number;
  createdAt: string;
}

interface BidHistoryItem {
  id: number;
  userBidId: number;
  userId: number;
  diamondBidId: number;
  bidAmount: string | number;
  editedAt: string;
  user?: { id: number; email: string };
}

const MonitorPage: React.FC = () => {
  const { token } = useAuth();
  const [diamondBids, setDiamondBids] = useState<DiamondBid[]>([]);
  const [selectedId, setSelectId] = useState<number | null>(null);
  const [bids, setBids] = useState<UserBid[]>([]);
  const [highestBid, setHighestBid] = useState<UserBid | null>(null);
  const [history, setHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiamondBids = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ bids: DiamondBid[] }>("/admin/diamond-bids", {
        method: "GET",
        authToken: token,
      });
      setDiamondBids(data.bids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diamond bids");
    }
  };

  const loadBids = async (id: number) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{
        diamondBid: DiamondBid;
        bids: UserBid[];
        highestBid: UserBid | null;
      }>(`/admin/diamond-bids/${id}/all-bids`, {
        method: "GET",
        authToken: token,
      });
      setBids(data.bids);
      setHighestBid(data.highestBid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id: number) => {
    if (!token) return;
    try {
      const data = await apiFetch<{ history: BidHistoryItem[] }>(
        `/admin/diamond-bids/${id}/bid-history`,
        { method: "GET", authToken: token }
      );
      setHistory(data.history);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    if (token) void loadDiamondBids();
  }, [token]);

  useEffect(() => {
    if (selectedId) {
      void loadBids(selectedId);
      void loadHistory(selectedId);
    } else {
      setBids([]);
      setHighestBid(null);
      setHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const declareResult = async () => {
    if (!selectedId) return;
    setError(null);
    try {
      await apiFetch(`/admin/diamond-bids/${selectedId}/declare-result`, {
        method: "POST",
        authToken: token,
      });
      await loadDiamondBids();
      await loadBids(selectedId);
      if (selectedId) void loadHistory(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to declare result");
    }
  };

  const selected = diamondBids.find((b) => b.id === selectedId);
  const canDeclare = selected?.status === "closed" && !selected?.resultDeclared;
  const alreadyDeclared = selected?.resultDeclared;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Diamond Bid</h2>
          <button
            onClick={() => void loadDiamondBids()}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
        <select
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={selectedId ?? ""}
          onChange={(e) => setSelectId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select --</option>
          {diamondBids.map((b) => (
            <option key={b.id} value={b.id}>
              {b.diamondName} ({b.status}) {b.resultDeclared ? "[declared]" : ""}
            </option>
          ))}
        </select>

        {selectedId && (
          <div className="mt-4 space-y-2">
            {alreadyDeclared && (
              <p className="text-xs text-emerald-400">Result already declared for this bid.</p>
            )}
            {selected?.status !== "closed" && selected && (
              <p className="text-xs text-slate-400">
                Bid must be closed (end time passed) to declare result.
              </p>
            )}
            <button
              onClick={declareResult}
              disabled={!canDeclare}
              className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Declare Result
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Bids</h2>
          {selectedId && (
            <button
              onClick={() => void loadBids(selectedId)}
              className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
            >
              Refresh
            </button>
          )}
        </div>

        {!selectedId ? (
          <p className="text-sm text-slate-400">Select a diamond bid to monitor.</p>
        ) : loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-300">
                  <tr className="border-b border-slate-800">
                    <th className="py-2 pr-4">User ID</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b) => {
                    const isHighest = highestBid?.id === b.id;
                    return (
                      <tr
                        key={b.id}
                        className={`border-b border-slate-900 ${isHighest ? "bg-emerald-500/10" : ""}`}
                      >
                        <td className="py-2 pr-4">{b.userId}</td>
                        <td className="py-2 pr-4 font-medium">{String(b.currentBidAmount)}</td>
                        <td className="py-2 pr-4 text-xs text-slate-400">
                          {new Date(b.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {bids.length === 0 && (
                    <tr>
                      <td className="py-3 text-slate-400" colSpan={3}>
                        No bids placed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Full bid history</h3>
              <p className="text-xs text-slate-500 mb-2">
                Every bid and update in chronological order (from start of bidding).
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-400 bg-slate-800/50">
                    <tr className="border-b border-slate-700">
                      <th className="py-2 pr-4 pl-3">#</th>
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={h.id} className="border-b border-slate-800/80">
                        <td className="py-2 pl-3 pr-4 text-slate-500">{idx + 1}</td>
                        <td className="py-2 pr-4 text-slate-200">
                          {h.user?.email ?? `User #${h.userId}`}
                        </td>
                        <td className="py-2 pr-4 font-medium">{String(h.bidAmount)}</td>
                        <td className="py-2 pr-4 text-xs text-slate-400">
                          {new Date(h.editedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td className="py-3 text-slate-500 pl-3" colSpan={4}>
                          No bid history yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {selectedId && (
                <button
                  type="button"
                  onClick={() => void loadHistory(selectedId)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300"
                >
                  Refresh history
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default MonitorPage;
