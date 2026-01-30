import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";

interface ResultItem {
  diamondBidId: number;
  diamondName: string;
  diamondImageUrl?: string | null;
  endDateTime: string;
  resultDeclared: boolean;
  declaredAt: string | null;
  winnerId: number | null;
  status: "win" | "lose";
}

const ResultsPage: React.FC = () => {
  const { token } = useAuth();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ results: ResultItem[] }>("/results/my-results", {
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
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Results</h2>
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
                <th className="py-2 pr-4">Ended</th>
                <th className="py-2 pr-4">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.diamondBidId} className="border-b border-slate-900">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-3">
                      {r.diamondImageUrl ? (
                        <img
                          src={getUploadUrl(r.diamondImageUrl)}
                          alt={r.diamondName}
                          className="h-10 w-10 rounded object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          —
                        </div>
                      )}
                      <span>{r.diamondName}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {new Date(r.endDateTime).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        r.status === "win"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
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

