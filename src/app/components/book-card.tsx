import { Book, BookStatus } from "../types";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { MoreVertical } from "lucide-react";
import { motion } from "motion/react";

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
}

const statusConfig: Record<BookStatus, { label: string; className: string }> = {
  "want-to-read": {
    label: "Quero Ler",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  reading: {
    label: "Lendo",
    className: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  },
  completed: {
    label: "Concluído",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
  },
};

export function BookCard({ book, onEdit }: BookCardProps) {
  const statusInfo = statusConfig[book.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-pink-200 overflow-hidden hover:shadow-2xl hover:shadow-pink-300/50 hover:border-pink-300 transition-all active:scale-95"
      onClick={() => onEdit?.(book)}
    >
      {/* Book Cover */}
      <div className="aspect-[2/3] bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-lg shadow-pink-300/50 touch-manipulation">
            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-pink-900 line-clamp-1 mb-0.5 sm:mb-1">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-pink-700/70 line-clamp-1">{book.author}</p>
        </div>

        {/* Status Badge */}
        <Badge className={`${statusInfo.className} text-xs rounded-full`}>
          {statusInfo.label}
        </Badge>

        {/* Progress Bar (only for reading books) */}
        {book.status === "reading" && (
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs text-pink-700">
              <span>Progresso</span>
              <span className="font-medium">{book.progress}%</span>
            </div>
            <Progress value={book.progress} className="h-2 bg-pink-100" />
            {book.currentPage && book.totalPages && (
              <p className="text-xs text-pink-600/70">
                Página {book.currentPage} de {book.totalPages}
              </p>
            )}
          </div>
        )}

        {book.category && (
          <p className="text-xs text-pink-600/70 truncate">
            {book.category}
          </p>
        )}
      </div>
    </motion.div>
  );
}