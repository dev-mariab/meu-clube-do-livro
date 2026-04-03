import { Book } from "../types";
import { Star } from "lucide-react";
import { Card } from "./ui/card";

interface BookReviewProps {
  book: Book;
}

export function BookReview({ book }: BookReviewProps) {
  if (!book.review && !book.rating) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
      <div className="space-y-3">
        {/* Rating Stars */}
        {book.rating && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= book.rating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-yellow-700">
              {book.rating}.0 / 5.0
            </span>
          </div>
        )}

        {/* Review Text */}
        {book.review && (
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="italic">"{book.review}"</p>
          </div>
        )}
      </div>
    </Card>
  );
}
