import { Router } from "express";
import {
  createWish,
  getWish,
  addReaction,
  getWishStats,
} from "../services/wishService.js";
import { asyncHandler, ValidationError } from "../lib/errors.js";

const router = Router();

// POST /api/wish — create a new wish
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const wish = await createWish(req.body);
    res.status(201).json(wish);
  })
);

// GET /api/wish/:id — get a wish by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const wish = await getWish(req.params.id);
    res.json(wish);
  })
);

// POST /api/wish/:id/reactions — add a reaction
router.post(
  "/:id/reactions",
  asyncHandler(async (req, res) => {
    const { emoji, count } = req.body;
    if (!emoji) {
      throw new ValidationError("emoji is required");
    }
    const delta = Math.max(1, Math.floor(Number(count) || 1));
    const reaction = await addReaction(req.params.id, emoji, delta);
    res.json(reaction);
  })
);

// GET /api/wish/:id/stats — get wish stats
router.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    const stats = await getWishStats(req.params.id);
    res.json(stats);
  })
);

export default router;
