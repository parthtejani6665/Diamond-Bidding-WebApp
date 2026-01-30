import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";

interface DiamondBidInfo {
  id: number;
  diamondName: string;
  diamondId: string;
  diamondImageUrl?: string | null;
  endDateTime: string;
}

interface WinnerInfo {
  id: number;
  email: string;
}

interface ResultItem {
  id: number;
  diamondBidId: number;
  winnerId: number;
  winningAmount: number | string;
  declaredAt: string;
  diamondBid: DiamondBidInfo;
  winner: WinnerInfo;
}

const ResultsPage: React.FC = () => {
  const { token } = useAuth();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ results: ResultItem[] }>("/admin/results", {
        method: "GET",
        authToken: token,
      });
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load();
  }, [token]);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">All Results</h2>
        <button
          onClick={load}
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-slate-400">No declared results yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-300">
              <tr className="border-b border-slate-800">
                <th className="py-2 pr-4">Diamond</th>
                <th className="py-2 pr-4">Winner</th>
                <th className="py-2 pr-4">Winning Amount</th>
                <th className="py-2 pr-4">Ended</th>
                <th className="py-2 pr-4">Declared At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-slate-900">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-3">
                      {r.diamondBid?.diamondImageUrl ? (
                        <img
                          src={getUploadUrl(r.diamondBid.diamondImageUrl)}
                          alt={r.diamondBid?.diamondName ?? ""}
                          className="h-10 w-10 rounded object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          —
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{r.diamondBid?.diamondName ?? "—"}</div>
                        <div className="text-xs text-slate-400">{r.diamondBid?.diamondId ?? ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-emerald-300">{r.winner?.email ?? "—"}</span>
                  </td>
                  <td className="py-2 pr-4 font-medium">{String(r.winningAmount)}</td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {r.diamondBid?.endDateTime
                      ? new Date(r.diamondBid.endDateTime).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {new Date(r.declaredAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  );
};

export default ResultsPage;
