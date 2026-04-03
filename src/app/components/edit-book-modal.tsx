import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Book, BookStatus } from "../types";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

export interface EditBookFormData {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  status: BookStatus;
  progress: number;
  totalPages?: number;
  currentPage?: number;
  coverImage?: string;
  rating?: number;
  review?: string;
}

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditBookFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function EditBookModal({
  book,
  open,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditBookModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditBookFormData>({
    title: "",
    author: "",
    isbn: "",
    category: "",
    status: "reading",
    progress: 0,
    totalPages: undefined,
    currentPage: undefined,
    rating: undefined,
    review: undefined,
  });

  useEffect(() => {
    if (book && open) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn || "",
        category: book.category || "",
        status: book.status,
        progress: book.progress || 0,
        totalPages: book.totalPages,
        currentPage: book.currentPage,
        rating: book.rating,
        review: book.review,
      });
      setCoverPreview(book.coverUrl);
      setCoverFile(null); // Reset so new uploads are explicit
    }
  }, [book, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      setCoverFile(result);
    };
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("[EditBookModal] Submitting form", {
        hasNewCoverFile: !!coverFile,
        coverFileSize: coverFile?.length || 0,
      });

      await onSubmit({
        ...formData,
        coverImage: coverFile || undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("[EditBookModal] Error submitting:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Editar Livro</DialogTitle>
            {onDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-500 hover:text-red-700 p-1"
                type="button"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cover Upload */}
            <div className="space-y-2">
              <Label>Capa do Livro</Label>
              {coverPreview ? (
                <div className="relative w-full aspect-[2/3] max-w-[200px] mx-auto">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Clique para fazer upload
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG ou WEBP (max. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="O nome do livro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor *</Label>
              <Input
                id="author"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Nome do autor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN (Opcional)</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="978-3-16-148410-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria (Opcional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ficção Científica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as BookStatus })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want-to-read">Quero Ler</SelectItem>
                  <SelectItem value="reading">Lendo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPages">Total de Páginas (Opcional)</Label>
              <Input
                id="totalPages"
                type="number"
                min="0"
                value={formData.totalPages || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalPages: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="300"
              />
            </div>

            {formData.totalPages && (
              <div className="space-y-2">
                <Label htmlFor="currentPage">
                  Página Atual ({formData.currentPage || 0} de {formData.totalPages})
                </Label>
                <Slider
                  id="currentPage"
                  min={0}
                  max={formData.totalPages}
                  step={1}
                  value={[formData.currentPage || 0]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currentPage: value[0] })
                  }
                  className="w-full"
                />
                <Input
                  type="number"
                  min="0"
                  max={formData.totalPages}
                  value={formData.currentPage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPage: e.target.value ? parseInt(e.target.value) : 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            )}

            {/* Rating (only for completed books) */}
            {formData.status === "completed" && (
              <div className="space-y-2">
                <Label htmlFor="rating">Avaliação (1-5 estrelas)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl transition-all ${
                        (formData.rating || 0) >= star
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Crítica/Avaliação (Opcional)</Label>
              <textarea
                id="review"
                value={formData.review || ""}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                placeholder="Compartilhe seus pensamentos sobre o livro..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Livro?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{book?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
