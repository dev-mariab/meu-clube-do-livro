import { useState, useEffect } from "react";
import { Search, Filter, Library as LibraryIcon } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { BookCard } from "../components/book-card";
import { EmptyState } from "../components/empty-state";
import { SkeletonBookCard } from "../components/skeleton-book-card";
import { EditBookModal, EditBookFormData } from "../components/edit-book-modal";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Book, BookStatus } from "../types";
import { api } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";

export function LibraryPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | "all">("all");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const booksData = await api.getBooks();
      setBooks(booksData);
    } catch (error: any) {
      console.error("Error loading books:", error);
      toast.error("Erro ao carregar biblioteca.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (formData: EditBookFormData) => {
    if (!editingBook) return;

    try {
      console.log("[LibraryPage] Saving book edit", {
        bookId: editingBook.id,
        hasNewCover: !!formData.coverImage,
        coverSize: formData.coverImage?.length || 0,
      });

      await api.updateBook(editingBook.id, {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        status: formData.status,
        progress: formData.progress,
        current_page: formData.currentPage,
        total_pages: formData.totalPages,
        coverUrl: formData.coverImage,
      });

      console.log("[LibraryPage] Book saved successfully");
      toast.success("Livro atualizado com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("[LibraryPage] Error updating book:", error);
      toast.error("Erro ao atualizar livro.");
    }
  };

  const handleDeleteBook = async () => {
    if (!editingBook) return;

    try {
      await api.deleteBook(editingBook.id);
      toast.success("Livro deletado com sucesso!");
      await loadData();
    } catch (error: any) {
      console.error("Error deleting book:", error);
      toast.error("Erro ao deletar livro.");
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || book.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Minha Biblioteca</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Gerencie e organize todos os seus livros
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 bg-white border-gray-300 text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
          <Button variant="outline" className="border-gray-300 h-10 sm:h-11 text-sm sm:text-base">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as BookStatus | "all")}>
            <TabsList className="bg-white border border-gray-200 inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">
                Todos ({books.length})
              </TabsTrigger>
              <TabsTrigger value="reading" className="text-xs sm:text-sm whitespace-nowrap">
                Lendo ({books.filter((b) => b.status === "reading").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm whitespace-nowrap">
                Concluídos ({books.filter((b) => b.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="want-to-read" className="text-xs sm:text-sm whitespace-nowrap">
                Quero Ler ({books.filter((b) => b.status === "want-to-read").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonBookCard key={i} />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <EmptyState
              icon={LibraryIcon}
              title={
                searchQuery
                  ? "Nenhum livro encontrado"
                  : "Nenhum livro nesta categoria"
              }
              description={
                searchQuery
                  ? "Tente ajustar sua pesquisa ou adicione novos livros."
                  : "Adicione livros para começar a organizar sua biblioteca."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onEdit={handleEditBook} />
            ))}
          </div>
        )}

        {/* Edit Book Modal */}
        <EditBookModal
          book={editingBook}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleSaveEdit}
          onDelete={handleDeleteBook}
        />
      </div>
    </div>
  );
}