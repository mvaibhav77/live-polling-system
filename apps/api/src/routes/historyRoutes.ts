import { Router } from "express";
import { PollHistoryService } from "../services/pollHistoryService";

const router = Router();

// Get all poll history (essential for data persistence)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const polls = await PollHistoryService.getAllPollHistory(limit);

    res.json({
      polls,
      total: polls.length,
      message: polls.length === 0 ? "No poll history found" : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch poll history" });
  }
});

export default router;
