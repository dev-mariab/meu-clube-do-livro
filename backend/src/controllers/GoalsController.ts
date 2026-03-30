import { Request, Response } from "express";
import { ReadingGoalModel } from "../models/ReadingGoal.js";

export class GoalsController {
  static async getGoals(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const goal = await ReadingGoalModel.findByUserId(req.user.userId);

      if (!goal) {
        res.json({
          yearlyBookGoal: null,
          yearlyPageGoal: null,
        });
        return;
      }

      res.json({
        yearlyBookGoal: goal.yearly_book_goal,
        yearlyPageGoal: goal.yearly_page_goal,
      });
    } catch (error) {
      console.error("[GoalsController] Get goals error:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  }

  static async setGoals(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { yearlyBookGoal, yearlyPageGoal } = req.body;

      const goal = await ReadingGoalModel.upsert(
        req.user.userId,
        yearlyBookGoal,
        yearlyPageGoal
      );

      res.json({
        yearlyBookGoal: goal.yearly_book_goal,
        yearlyPageGoal: goal.yearly_page_goal,
      });
    } catch (error) {
      console.error("[GoalsController] Set goals error:", error);
      res.status(500).json({ error: "Failed to set goals" });
    }
  }
}
