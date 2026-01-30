"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiamond = exports.updateDiamond = exports.createDiamond = exports.listDiamonds = void 0;
const Diamond_1 = require("../models/Diamond");
const params_1 = require("../utils/params");
const listDiamonds = async (_req, res) => {
    try {
        const diamonds = await Diamond_1.Diamond.findAll({
            order: [["createdAt", "DESC"]],
        });
        return res.json({ diamonds });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch diamonds" });
    }
};
exports.listDiamonds = listDiamonds;
const createDiamond = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const body = req.body;
        const name = (_a = body.name) === null || _a === void 0 ? void 0 : _a.trim();
        const diamondId = (_b = body.diamondId) === null || _b === void 0 ? void 0 : _b.trim();
        const carat = body.carat ? parseFloat(body.carat) : null;
        const basePrice = body.basePrice ? parseFloat(body.basePrice) : null;
        const cut = ((_c = body.cut) === null || _c === void 0 ? void 0 : _c.trim()) || null;
        const color = ((_d = body.color) === null || _d === void 0 ? void 0 : _d.trim()) || null;
        const clarity = ((_e = body.clarity) === null || _e === void 0 ? void 0 : _e.trim()) || null;
        if (!name || !diamondId) {
            return res.status(400).json({ message: "Name and diamond ID are required" });
        }
        const existing = await Diamond_1.Diamond.findOne({ where: { diamondId } });
        if (existing) {
            return res.status(409).json({ message: "Diamond ID already exists" });
        }
        const file = req.file;
        const imageUrl = file ? `/uploads/diamonds/${file.filename}` : null;
        const diamond = await Diamond_1.Diamond.create({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create diamond" });
    }
};
exports.createDiamond = createDiamond;
const updateDiamond = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const { name, diamondId, carat, cut, color, clarity, basePrice } = req.body;
        const diamond = await Diamond_1.Diamond.findByPk(id);
        if (!diamond) {
            return res.status(404).json({ message: "Diamond not found" });
        }
        if (diamondId && diamondId !== diamond.diamondId) {
            const existing = await Diamond_1.Diamond.findOne({ where: { diamondId } });
            if (existing) {
                return res.status(409).json({ message: "Diamond ID already exists" });
            }
            diamond.diamondId = diamondId;
        }
        if (name)
            diamond.name = name;
        if (carat !== undefined)
            diamond.carat = carat;
        if (cut !== undefined)
            diamond.cut = cut;
        if (color !== undefined)
            diamond.color = color;
        if (clarity !== undefined)
            diamond.clarity = clarity;
        if (basePrice !== undefined)
            diamond.basePrice = basePrice;
        await diamond.save();
        return res.json({ diamond });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update diamond" });
    }
};
exports.updateDiamond = updateDiamond;
const deleteDiamond = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const diamond = await Diamond_1.Diamond.findByPk(id);
        if (!diamond) {
            return res.status(404).json({ message: "Diamond not found" });
        }
        await diamond.destroy();
        return res.json({ message: "Diamond deleted" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete diamond" });
    }
};
exports.deleteDiamond = deleteDiamond;
//# sourceMappingURL=diamondController.js.map