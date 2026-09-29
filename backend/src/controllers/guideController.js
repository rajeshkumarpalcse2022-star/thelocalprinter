const GuideRow = require("../models/GuideRow");

const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;
const MAX_VALUES = 20;
const MAX_VALUE_LENGTH = 120;

// Admins can just type "Excellent" — the star is added automatically.
const formatValue = (value) => {
  const text = (value || "").toString().trim();
  if (!text) return "";
  return /^excellent$/i.test(text) ? `\u2b50 ${text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}` : text;
};

exports.getGuideRows = async (req, res) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();
    if (!SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ success: false, message: "Invalid guide slug" });
    }

    const rows = await GuideRow.find({ slug }).sort({ createdAt: 1, _id: 1 });

    res.status(200).json({ success: true, data: { rows } });
  } catch (error) {
    console.error("getGuideRows error:", error);
    res.status(500).json({ success: false, message: "Server error fetching guide rows" });
  }
};

exports.addGuideRow = async (req, res) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();
    if (!SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ success: false, message: "Invalid guide slug" });
    }

    const feature = (req.body.feature || "").toString().trim();
    if (!feature) {
      return res.status(400).json({ success: false, message: "Feature name is required" });
    }

    const rawValues = Array.isArray(req.body.values) ? req.body.values : [];
    if (rawValues.length > MAX_VALUES) {
      return res.status(400).json({ success: false, message: "Too many values in one row" });
    }

    const values = rawValues.map((v) => {
      const text = (v || "").toString().slice(0, MAX_VALUE_LENGTH);
      return formatValue(text);
    });

    const row = await GuideRow.create({ slug, feature: feature.slice(0, 80), values });

    res.status(201).json({ success: true, message: "Row added", data: { row } });
  } catch (error) {
    console.error("addGuideRow error:", error);
    res.status(500).json({ success: false, message: "Server error adding guide row" });
  }
};

exports.deleteGuideRow = async (req, res) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();
    if (!SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ success: false, message: "Invalid guide slug" });
    }

    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid row id" });
    }

    const row = await GuideRow.findOneAndDelete({ _id: id, slug });
    if (!row) {
      return res.status(404).json({ success: false, message: "Row not found" });
    }

    res.status(200).json({ success: true, message: "Row deleted" });
  } catch (error) {
    console.error("deleteGuideRow error:", error);
    res.status(500).json({ success: false, message: "Server error deleting guide row" });
  }
};
