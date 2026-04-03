import { useState } from "react";
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
import { BookStatus } from "../types";
import { Loader2, Upload, X } from "lucide-react";

export interface BookFormData {
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

interface AddBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BookFormData) => void | Promise<void>;
}

export function AddBookModal({ open, onOpenChange, onSubmit }: AddBookModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    category: "",
    status: "want-to-read",
    progress: 0,
    totalPages: undefined,
    currentPage: undefined,
    rating: undefined,
    review: undefined,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    // Read file as base64
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
      await onSubmit({
        ...formData,
        coverImage: coverFile || undefined,
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        status: "want-to-read",
        progress: 0,
        totalPages: undefined,
        currentPage: undefined,
        rating: undefined,
        review: undefined,
      });
      setCoverPreview(null);
      setCoverFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Livro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Upload */}
          <div className="space-y-2">
            <Label>Capa do Livro (Opcional)</Label>
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="O nome do livro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Autor *</Label>
            <Input
              id="author"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Nome do autor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="978-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ex: Ficção"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BookStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="want-to-read">Quero Ler</SelectItem>
                <SelectItem value="reading">Lendo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "reading" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPage">Página Atual</Label>
                  <Input
                    id="currentPage"
                    type="number"
                    min="0"
                    value={formData.currentPage || ""}
                    onChange={(e) => {
                      const current = parseInt(e.target.value) || 0;
                      const total = formData.totalPages || 0;
                      const progress =
                        total > 0 ? Math.round((current / total) * 100) : 0;
                      setFormData({
                        ...formData,
                        currentPage: current,
                        progress,
                      });
                    }}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPages">Total de Páginas</Label>
                  <Input
                    id="totalPages"
                    type="number"
                    min="1"
                    value={formData.totalPages || ""}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0;
                      const current = formData.currentPage || 0;
                      const progress =
                        total > 0 ? Math.round((current / total) * 100) : 0;
                      setFormData({
                        ...formData,
                        totalPages: total,
                        progress,
                      });
                    }}
                    placeholder="300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Progresso: {formData.progress}%</Label>
                <Slider
                  value={[formData.progress]}
                  onValueChange={([value]) => setFormData({ ...formData, progress: value })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </>
          )}

          {formData.status === "completed" && (
            <div className="space-y-2">
              <Label htmlFor="totalPages">Total de Páginas</Label>
              <Input
                id="totalPages"
                type="number"
                min="1"
                value={formData.totalPages || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalPages: parseInt(e.target.value) || undefined,
                    progress: 100,
                  })
                }
                placeholder="300"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar Livro"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}