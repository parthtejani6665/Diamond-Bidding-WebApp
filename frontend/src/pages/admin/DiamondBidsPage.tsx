import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";

interface DiamondBid {
  id: number;
  diamondName: string;
  diamondId: string;
  diamondImageUrl?: string | null;
  baseDiamondPrice: string | number;
  baseBidPrice: string | number;
  startDateTime: string;
  endDateTime: string;
  status: "draft" | "active" | "closed";
  resultDeclared: boolean;
  winnerId: number | null;
  declaredAt: string | null;
}

const DiamondBidsPage: React.FC = () => {
  const { token } = useAuth();
  const [bids, setBids] = useState<DiamondBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [diamondName, setDiamondName] = useState("");
  const [diamondId, setDiamondId] = useState("");
  const [baseDiamondPrice, setBaseDiamondPrice] = useState<number>(0);
  const [baseBidPrice, setBaseBidPrice] = useState<number>(0);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [diamondImage, setDiamondImage] = useState<File | null>(null);

  const canSubmit = useMemo(() => {
    return (
      diamondName.trim() &&
      diamondId.trim() &&
      baseDiamondPrice > 0 &&
      baseBidPrice > 0 &&
      startDateTime &&
      endDateTime
    );
  }, [diamondName, diamondId, baseDiamondPrice, baseBidPrice, startDateTime, endDateTime]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ bids: DiamondBid[] }>("/admin/diamond-bids", {
        method: "GET",
        authToken: token,
      });
      setBids(data.bids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diamond bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load();
  }, [token]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const form = new FormData();
      form.append("diamondName", diamondName);
      form.append("diamondId", diamondId);
      form.append("baseDiamondPrice", String(baseDiamondPrice));
      form.append("baseBidPrice", String(baseBidPrice));
      form.append("startDateTime", startDateTime);
      form.append("endDateTime", endDateTime);
      if (diamondImage) {
        form.append("diamondImage", diamondImage);
      }

      await apiFetch<{ bid: DiamondBid }>("/admin/diamond-bids", {
        method: "POST",
        authToken: token,
        body: form,
      });
      setDiamondName("");
      setDiamondId("");
      setBaseDiamondPrice(0);
      setBaseBidPrice(0);
      setStartDateTime("");
      setEndDateTime("");
      setDiamondImage(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bid");
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await apiFetch<unknown>(`/admin/diamond-bids/${id}`, {
        method: "DELETE",
        authToken: token,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bid");
    }
  };

  const declareResult = async (id: number) => {
    setError(null);
    try {
      await apiFetch<unknown>(`/admin/diamond-bids/${id}/declare-result`, {
        method: "POST",
        authToken: token,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to declare result");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Create Diamond Bid</h2>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Diamond Name"
            value={diamondName}
            onChange={(e) => setDiamondName(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Diamond ID"
            value={diamondId}
            onChange={(e) => setDiamondId(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Base Diamond Price"
            type="number"
            min={0}
            value={baseDiamondPrice}
            onChange={(e) => setBaseDiamondPrice(Number(e.target.value))}
            required
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Base Bid Price"
            type="number"
            min={0}
            value={baseBidPrice}
            onChange={(e) => setBaseBidPrice(Number(e.target.value))}
            required
          />
          <label className="text-sm text-slate-300">
            Start
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
            />
          </label>
          <label className="text-sm text-slate-300">
            End
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              required
            />
          </label>
          <label className="text-sm text-slate-300">
            Diamond Image (optional)
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              onChange={(e) => setDiamondImage(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={!canSubmit}
            className="md:col-span-3 rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            Create Bid
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Diamond Bids</h2>
          <button
            onClick={load}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="py-2 pr-4">Diamond</th>
                  <th className="py-2 pr-4">Photo</th>
                  <th className="py-2 pr-4">Base Bid</th>
                  <th className="py-2 pr-4">Window</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Result</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={b.id} className="border-b border-slate-900">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{b.diamondName}</div>
                      <div className="text-xs text-slate-400">{b.diamondId}</div>
                    </td>
                    <td className="py-2 pr-4">
                      {b.diamondImageUrl ? (
                        <img
                          src={getUploadUrl(b.diamondImageUrl)}
                          alt={b.diamondName}
                          className="h-10 w-10 rounded object-cover border border-slate-800"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{String(b.baseBidPrice)}</td>
                    <td className="py-2 pr-4">
                      <div className="text-xs text-slate-300">
                        {new Date(b.startDateTime).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(b.endDateTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs bg-slate-800 text-slate-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {b.status === "closed" && b.resultDeclared && (
                        <span className="text-xs text-emerald-400">Declared</span>
                      )}
                      {b.status === "closed" && !b.resultDeclared && (
                        <button
                          onClick={() => declareResult(b.id)}
                          className="rounded-lg border border-emerald-600 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Declare result
                        </button>
                      )}
                      {b.status !== "closed" && <span className="text-xs text-slate-500">—</span>}
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => remove(b.id)}
                        disabled={b.status !== "draft"}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800 disabled:opacity-50"
                      >
                        Delete (draft only)
                      </button>
                    </td>
                  </tr>
                ))}
                {bids.length === 0 && (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={7}>
                      No bids found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DiamondBidsPage;
