import prisma from "../config/database";

export interface PollHistoryData {
  question: string;
  options: string[];
  responses: Record<string, number>;
  totalParticipants: number;
}

export class PollHistoryService {
  static async savePollResult(data: PollHistoryData) {
    try {
      const result = await prisma.pollHistory.create({
        data: {
          question: data.question,
          options: data.options,
          responses: data.responses,
          totalParticipants: data.totalParticipants,
          completedAt: new Date(),
        },
      });
      return result;
    } catch (error) {
      console.error("Error saving poll result:", error);
      throw new Error("Failed to save poll result");
    }
  }

  static async getAllPollHistory(limit: number = 50) {
    try {
      const polls = await prisma.pollHistory.findMany({
        orderBy: {
          completedAt: "desc",
        },
        take: limit,
      });
      return polls;
    } catch (error) {
      console.error("Error fetching poll history:", error);
      throw new Error("Failed to fetch poll history");
    }
  }

  static async getPollById(id: string) {
    try {
      const poll = await prisma.pollHistory.findUnique({
        where: { id },
      });
      return poll;
    } catch (error) {
      console.error("Error fetching poll by ID:", error);
      throw new Error("Failed to fetch poll");
    }
  }

  static async deletePollHistory(id: string) {
    try {
      await prisma.pollHistory.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting poll:", error);
      throw new Error("Failed to delete poll");
    }
  }
}
