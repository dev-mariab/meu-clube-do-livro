import pool from "../config/database.js";

export interface ReadingGoal {
  id: string;
  user_id: string;
  yearly_book_goal?: number;
  yearly_page_goal?: number;
  created_at: Date;
  updated_at: Date;
}

export class ReadingGoalModel {
  static async findByUserId(userId: string): Promise<ReadingGoal | null> {
    const result = await pool.query(
      "SELECT * FROM reading_goals WHERE user_id = $1",
      [userId] as any
    );
    return result.rows[0] || null;
  }

  static async upsert(
    userId: string,
    yearlyBookGoal?: number,
    yearlyPageGoal?: number
  ): Promise<ReadingGoal> {
    const result = await pool.query(
      `INSERT INTO reading_goals (user_id, yearly_book_goal, yearly_page_goal)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET yearly_book_goal = $2, yearly_page_goal = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, yearlyBookGoal, yearlyPageGoal] as any
    );

    return result.rows[0];
  }
}
