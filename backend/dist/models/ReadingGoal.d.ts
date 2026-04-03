export interface ReadingGoal {
    id: string;
    user_id: string;
    yearly_book_goal?: number;
    yearly_page_goal?: number;
    created_at: Date;
    updated_at: Date;
}
export declare class ReadingGoalModel {
    static findByUserId(userId: string): Promise<ReadingGoal | null>;
    static upsert(userId: string, yearlyBookGoal?: number, yearlyPageGoal?: number): Promise<ReadingGoal>;
}
//# sourceMappingURL=ReadingGoal.d.ts.map