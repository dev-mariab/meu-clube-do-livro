import { useState, useEffect } from "react";
import { BookOpen, BookMarked, FileText, Plus, Library as LibraryIcon } from "lucide-react";
import { StatsCard } from "../components/stats-card";
import { BookCard } from "../components/book-card";
import { AddBookModal, BookFormData } from "../components/add-book-modal";
import { EmptyState } from "../components/empty-state";
import { SkeletonBookCard } from "../components/skeleton-book-card";
import { Button } from "../components/ui/button";
import { Book, ReadingStats } from "../types";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api } from "../lib/api";

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<ReadingStats>({
    booksRead: 0,
    currentlyReading: 0,
    pagesThisYear: 0,
  });
  const [goals, setGoals] = useState({
    yearlyBookGoal: null as number | null,
    yearlyPageGoal: null as number | null,
  });

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [booksData, statsData, goalsData] = await Promise.all([
        api.getBooks(),
        api.getStats(),
        api.getGoals().catch(() => ({ yearlyBookGoal: null, yearlyPageGoal: null })),
      ]);
      setBooks(booksData);
      setStats(statsData);
      setGoals(goalsData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      // Only show error if it's not an auth issue (auth issues are handled by redirect)
      if (!error.message?.includes("Unauthorized") && !error.message?.includes("401")) {
        toast.error("Erro ao carregar dados. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (bookData: BookFormData) => {
    try {
      let coverUrl = null;

      // Upload cover if provided
      if (bookData.coverImage) {
        try {
          coverUrl = await api.uploadCover(bookData.coverImage, "cover.jpg");
        } catch (error) {
          console.error("Error uploading cover:", error);
          toast.error("Erro ao fazer upload da capa, usando capa padrão");
        }
      }

      // If no custom cover, use random Unsplash image
      if (!coverUrl) {
        const covers = [
          "https://images.unsplash.com/photo-1752243731865-c2fa851af7ec?w=400",
          "https://images.unsplash.com/photo-1763768861268-cb6b54173dbf?w=400",
          "https://images.unsplash.com/photo-1723220217588-3fc2fb87b69a?w=400",
          "https://images.unsplash.com/photo-1758803184789-a5dd872fe82e?w=400",
          "https://images.unsplash.com/photo-1771765413413-65c53d3b5bf6?w=400",
          "https://images.unsplash.com/photo-1491588153350-fc167db6f080?w=400",
        ];
        coverUrl = covers[Math.floor(Math.random() * covers.length)];
      }

      const newBook = await api.createBook({
        ...bookData,
        coverUrl,
      });

      setBooks([newBook, ...books]);
      setIsModalOpen(false);
      toast.success("Livro adicionado com sucesso!");
      
      // Reload stats
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Erro ao adicionar livro. Tente novamente.");
    }
  };

  const readingBooks = books.filter((b) => b.status === "reading");
  const recentBooks = books.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Início
          </h1>
          <p className="text-xs sm:text-sm text-pink-700/80 mt-1">
            Bem-vinda de volta! ✨ Aqui está um resumo da sua biblioteca.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            <StatsCard
              title="Livros Lidos"
              value={stats.booksRead}
              icon={BookMarked}
              description={
                goals.yearlyBookGoal
                  ? `Meta: ${goals.yearlyBookGoal} livros`
                  : "Total de livros concluídos"
              }
            />
            <StatsCard
              title="Lendo Agora"
              value={stats.currentlyReading}
              icon={BookOpen}
              description="Livros em progresso"
            />
            <StatsCard
              title="Páginas este Ano"
              value={stats.pagesThisYear.toLocaleString()}
              icon={FileText}
              description={
                goals.yearlyPageGoal
                  ? `Meta: ${goals.yearlyPageGoal.toLocaleString()} páginas`
                  : "Total de páginas lidas"
              }
            />
          </motion.div>
        )}

        {/* Currently Reading Section */}
        {!isLoading && readingBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Lendo Agora</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {readingBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Books Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {isLoading ? "Carregando..." : "Biblioteca Recente"}
            </h2>
            {!isLoading && books.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
              >
                Ver todos
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBookCard key={i} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <EmptyState
                icon={LibraryIcon}
                title="Nenhum livro cadastrado"
                description="Comece adicionando seu primeiro livro à sua estante digital e acompanhe seu progresso de leitura."
                action={{
                  label: "Adicionar Primeiro Livro",
                  onClick: () => setIsModalOpen(true),
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
            >
              {recentBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {!isLoading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl shadow-pink-400/50 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex items-center justify-center z-30 group"
            size="icon"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform" />
          </Button>
        </motion.div>
      )}

      {/* Add Book Modal */}
      <AddBookModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddBook}
      />
    </div>
  );
}