import { Router } from "express";
import { PollHistoryService } from "../services/pollHistoryService";

const router = Router();

// Get all poll history
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

// Get specific poll result by ID
// router.get('/history/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const poll = await PollHistoryService.getPollById(id);

//     if (!poll) {
//       return res.status(404).json({ error: 'Poll not found' });
//     }

//     res.json({ poll });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch poll' });
//   }
// });

// // Delete poll from history (admin function)
// router.delete('/history/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await PollHistoryService.deletePollHistory(id);

//     res.json({ message: 'Poll deleted from history' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete poll' });
//   }
// });

export default router;
