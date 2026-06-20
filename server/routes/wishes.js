import { Router } from "express";
import {
  createWish,
  getWish,
  addReaction,
  getWishStats,
} from "../services/wishService.js";

const router = Router();

// POST /api/wish — create a new wish
router.post("/", async (req, res) => {
  try {
    const wish = await createWish(req.body);
    res.status(201).json(wish);
  } catch (err) {
    console.error("Create wish error:", err);
    if (err.message.includes("required") || err.message.includes("Maximum")) {
      return res.status(400).json({ error: err.message });
    }
    // Surface the real error — don't hide it behind a generic message
    res.status(500).json({
      error: err.message || "Failed to create wish",
      code: err.code || undefined,
    });
  }
});

// GET /api/wish/:id — get a wish by ID
router.get("/:id", async (req, res) => {
  try {
    const wish = await getWish(req.params.id);
    res.json(wish);
  } catch (err) {
    if (err.message === "Wish not found") {
      return res.status(404).json({ error: "Wish not found" });
    }
    console.error("Get wish error:", err);
    res.status(500).json({ error: "Failed to fetch wish" });
  }
});

// POST /api/wish/:id/reactions — add a reaction
router.post("/:id/reactions", async (req, res) => {
  try {
    const { emoji, count } = req.body;
    if (!emoji) {
      return res.status(400).json({ error: "emoji is required" });
    }
    const delta = Math.max(1, Math.floor(Number(count) || 1));
    const reaction = await addReaction(req.params.id, emoji, delta);
    res.json(reaction);
  } catch (err) {
    console.error("Add reaction error:", err);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

// GET /api/wish/:id/stats — get wish stats
router.get("/:id/stats", async (req, res) => {
  try {
    const stats = await getWishStats(req.params.id);
    res.json(stats);
  } catch (err) {
    if (err.message === "Wish not found") {
      return res.status(404).json({ error: "Wish not found" });
    }
    console.error("Get stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
