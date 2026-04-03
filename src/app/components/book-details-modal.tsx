import { Book } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BookReview } from "./book-review";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface BookDetailsModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "want-to-read": {
    label: "Quero Ler",
    className: "bg-purple-100 text-purple-700",
  },
  reading: {
    label: "Lendo",
    className: "bg-pink-100 text-pink-700",
  },
  completed: {
    label: "Concluído",
    className: "bg-green-100 text-green-700",
  },
};

export function BookDetailsModal({
  book,
  open,
  onOpenChange,
}: BookDetailsModalProps) {
  if (!book) return null;

  const statusInfo = statusConfig[book.status] || { label: "", className: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover & Basic Info */}
          <div className="flex gap-6">
            {book.coverUrl && (
              <div className="flex-shrink-0">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <p className="text-lg text-pink-700">{book.author}</p>
              <Badge className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
              {book.category && (
                <p className="text-sm text-gray-600">
                  <strong>Categoria:</strong> {book.category}
                </p>
              )}
              {book.isbn && (
                <p className="text-sm text-gray-600">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}

              {/* Progress Info */}
              {book.status === "reading" && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Progresso:</strong> {book.progress}%
                  </p>
                  {book.currentPage && book.totalPages && (
                    <p className="text-sm">
                      <strong>Páginas:</strong> {book.currentPage} de{" "}
                      {book.totalPages}
                    </p>
                  )}
                </div>
              )}

              {book.status === "completed" && book.totalPages && (
                <p className="text-sm">
                  <strong>Total de páginas:</strong> {book.totalPages}
                </p>
              )}
            </div>
          </div>

          {/* Review Section */}
          {book.status === "completed" && (book.review || book.rating) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900">
                Avaliação e Crítica
              </h3>
              <BookReview book={book} />
            </div>
          )}

          {book.status === "completed" && !book.review && !book.rating && (
            <p className="text-sm text-gray-500 italic">
              Nenhuma crítica ou avaliação adicionada para este livro.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
