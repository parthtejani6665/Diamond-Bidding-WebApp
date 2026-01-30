import { Response } from "express";
import { Diamond } from "../models/Diamond";
import { AuthRequest } from "../middleware/auth";
import { parseIdParam } from "../utils/params";

export const listDiamonds = async (_req: AuthRequest, res: Response) => {
  try {
    const diamonds = await Diamond.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json({ diamonds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch diamonds" });
  }
};

export const createDiamond = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as Record<string, string | undefined>;
    const name = body.name?.trim();
    const diamondId = body.diamondId?.trim();
    const carat = body.carat ? parseFloat(body.carat) : null;
    const basePrice = body.basePrice ? parseFloat(body.basePrice) : null;
    const cut = body.cut?.trim() || null;
    const color = body.color?.trim() || null;
    const clarity = body.clarity?.trim() || null;

    if (!name || !diamondId) {
      return res.status(400).json({ message: "Name and diamond ID are required" });
    }

    const existing = await Diamond.findOne({ where: { diamondId } });
    if (existing) {
      return res.status(409).json({ message: "Diamond ID already exists" });
    }

    const file = (req as AuthRequest & { file?: { filename: string } }).file;
    const imageUrl = file ? `/uploads/diamonds/${file.filename}` : null;

    const diamond = await Diamond.create({
      name,
      diamondId,
      imageUrl,
      carat: Number.isNaN(carat) ? null : carat,
      cut,
      color,
      clarity,
      basePrice: Number.isNaN(basePrice) ? null : basePrice,
    });

    return res.status(201).json({ diamond });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create diamond" });
  }
};

export const updateDiamond = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { name, diamondId, carat, cut, color, clarity, basePrice } = req.body as {
      name?: string;
      diamondId?: string;
      carat?: number;
      cut?: string;
      color?: string;
      clarity?: string;
      basePrice?: number;
    };

    const diamond = await Diamond.findByPk(id);
    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    if (diamondId && diamondId !== diamond.diamondId) {
      const existing = await Diamond.findOne({ where: { diamondId } });
      if (existing) {
        return res.status(409).json({ message: "Diamond ID already exists" });
      }
      diamond.diamondId = diamondId;
    }

    if (name) diamond.name = name;
    if (carat !== undefined) diamond.carat = carat;
    if (cut !== undefined) diamond.cut = cut;
    if (color !== undefined) diamond.color = color;
    if (clarity !== undefined) diamond.clarity = clarity;
    if (basePrice !== undefined) diamond.basePrice = basePrice;

    await diamond.save();
    return res.json({ diamond });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update diamond" });
  }
};

export const deleteDiamond = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const diamond = await Diamond.findByPk(id);
    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    await diamond.destroy();
    return res.json({ message: "Diamond deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete diamond" });
  }
};
