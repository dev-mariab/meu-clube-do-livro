import { pool } from "../config/database.js";
export class ReadingGoalModel {
    static async findByUserId(userId) {
        const result = await pool.query("SELECT * FROM reading_goals WHERE user_id = $1", [userId]);
        return result.rows[0] || null;
    }
    static async upsert(userId, yearlyBookGoal, yearlyPageGoal) {
        const result = await pool.query(`INSERT INTO reading_goals (user_id, yearly_book_goal, yearly_page_goal)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET yearly_book_goal = $2, yearly_page_goal = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`, [userId, yearlyBookGoal, yearlyPageGoal]);
        return result.rows[0];
    }
}
//# sourceMappingURL=ReadingGoal.js.map