import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, getUploadUrl } from "../../services/api";

interface Diamond {
  id: number;
  name: string;
  diamondId: string;
  imageUrl?: string | null;
  carat?: number | string | null;
  cut?: string | null;
  color?: string | null;
  clarity?: string | null;
  basePrice?: number | string | null;
  createdAt: string;
  updatedAt: string;
}

const DiamondsPage: React.FC = () => {
  const { token } = useAuth();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [diamondId, setDiamondId] = useState("");
  const [carat, setCarat] = useState<string>("");
  const [cut, setCut] = useState("");
  const [color, setColor] = useState("");
  const [clarity, setClarity] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [diamondImage, setDiamondImage] = useState<File | null>(null);

  const canSubmit = useMemo(
    () => name.trim() && diamondId.trim(),
    [name, diamondId]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ diamonds: Diamond[] }>("/admin/diamonds", {
        method: "GET",
        authToken: token,
      });
      setDiamonds(data.diamonds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diamonds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("diamondId", diamondId);
      if (carat) form.append("carat", carat);
      if (cut) form.append("cut", cut);
      if (color) form.append("color", color);
      if (clarity) form.append("clarity", clarity);
      if (basePrice) form.append("basePrice", basePrice);
      if (diamondImage) form.append("diamondImage", diamondImage);

      await apiFetch<{ diamond: Diamond }>("/admin/diamonds", {
        method: "POST",
        authToken: token,
        body: form,
      });
      setName("");
      setDiamondId("");
      setCarat("");
      setCut("");
      setColor("");
      setClarity("");
      setBasePrice("");
      setDiamondImage(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create diamond");
    }
  };

  const remove = async (id: number) => {
    setError(null);
    try {
      await apiFetch<unknown>(`/admin/diamonds/${id}`, {
        method: "DELETE",
        authToken: token,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete diamond");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Add Diamond</h2>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            placeholder="Carat"
            type="number"
            step="0.01"
            min="0"
            value={carat}
            onChange={(e) => setCarat(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Cut"
            value={cut}
            onChange={(e) => setCut(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Clarity"
            value={clarity}
            onChange={(e) => setClarity(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Base Price"
            type="number"
            step="0.01"
            min="0"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
          <label className="text-sm text-slate-300">
            Image (optional)
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
            className="md:col-span-4 rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            Add Diamond
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Diamonds</h2>
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
                  <th className="py-2 pr-4">Photo</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Carat</th>
                  <th className="py-2 pr-4">Cut</th>
                  <th className="py-2 pr-4">Color</th>
                  <th className="py-2 pr-4">Clarity</th>
                  <th className="py-2 pr-4">Base Price</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {diamonds.map((d) => (
                  <tr key={d.id} className="border-b border-slate-900">
                    <td className="py-2 pr-4">
                      {d.imageUrl ? (
                        <img
                          src={getUploadUrl(d.imageUrl)}
                          alt={d.name}
                          className="h-10 w-10 rounded object-cover border border-slate-800"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 font-medium">{d.name}</td>
                    <td className="py-2 pr-4 text-slate-400">{d.diamondId}</td>
                    <td className="py-2 pr-4">{d.carat ?? "—"}</td>
                    <td className="py-2 pr-4">{d.cut ?? "—"}</td>
                    <td className="py-2 pr-4">{d.color ?? "—"}</td>
                    <td className="py-2 pr-4">{d.clarity ?? "—"}</td>
                    <td className="py-2 pr-4">{d.basePrice ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => remove(d.id)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800 text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {diamonds.length === 0 && (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={9}>
                      No diamonds found.
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

export default DiamondsPage;
