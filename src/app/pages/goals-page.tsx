import { useState, useEffect } from "react";
import { Target, BookOpen, FileText, Sparkles, TrendingUp, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { api } from "../lib/api";
import { toast } from "sonner";
import { motion } from "motion/react";

export function GoalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [goals, setGoals] = useState({
    yearlyBookGoal: null as number | null,
    yearlyPageGoal: null as number | null,
  });
  const [formData, setFormData] = useState({
    yearlyBookGoal: "",
    yearlyPageGoal: "",
  });
  const [stats, setStats] = useState({
    booksRead: 0,
    pagesThisYear: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [goalsData, statsData] = await Promise.all([
        api.getGoals().catch(() => ({ yearlyBookGoal: null, yearlyPageGoal: null })),
        api.getStats(),
      ]);
      
      setGoals(goalsData);
      setFormData({
        yearlyBookGoal: goalsData.yearlyBookGoal?.toString() || "",
        yearlyPageGoal: goalsData.yearlyPageGoal?.toString() || "",
      });
      setStats({
        booksRead: statsData.booksRead,
        pagesThisYear: statsData.pagesThisYear,
      });
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const bookGoal = formData.yearlyBookGoal ? parseInt(formData.yearlyBookGoal) : null;
      const pageGoal = formData.yearlyPageGoal ? parseInt(formData.yearlyPageGoal) : null;

      await api.setGoals(bookGoal, pageGoal);
      
      setGoals({
        yearlyBookGoal: bookGoal,
        yearlyPageGoal: pageGoal,
      });

      toast.success("Metas atualizadas com sucesso! ✨");
    } catch (error) {
      console.error("Error saving goals:", error);
      toast.error("Erro ao salvar metas");
    } finally {
      setIsSaving(false);
    }
  };

  const bookProgress = goals.yearlyBookGoal 
    ? Math.min(Math.round((stats.booksRead / goals.yearlyBookGoal) * 100), 100)
    : 0;

  const pageProgress = goals.yearlyPageGoal
    ? Math.min(Math.round((stats.pagesThisYear / goals.yearlyPageGoal) * 100), 100)
    : 0;

  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-pink-700">Carregando metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Metas de Leitura {currentYear}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-pink-700/80">
            Defina suas metas de leitura e acompanhe seu progresso ✨
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Progress Cards */}
        {(goals.yearlyBookGoal || goals.yearlyPageGoal) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Book Goal Progress */}
            {goals.yearlyBookGoal && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-pink-900">Meta de Livros</h3>
                    <p className="text-sm text-pink-600/70">
                      {stats.booksRead} de {goals.yearlyBookGoal} livros
                    </p>
                  </div>
                </div>
                <Progress value={bookProgress} className="h-3 mb-2 bg-pink-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pink-700 font-medium">{bookProgress}% completo</span>
                  {bookProgress >= 100 && (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Meta atingida!
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Page Goal Progress */}
            {goals.yearlyPageGoal && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-pink-900">Meta de Páginas</h3>
                    <p className="text-sm text-pink-600/70">
                      {stats.pagesThisYear.toLocaleString()} de {goals.yearlyPageGoal.toLocaleString()} páginas
                    </p>
                  </div>
                </div>
                <Progress value={pageProgress} className="h-3 mb-2 bg-purple-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pink-700 font-medium">{pageProgress}% completo</span>
                  {pageProgress >= 100 && (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Meta atingida!
                    </span>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Goal Setting Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-pink-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <h2 className="text-lg font-semibold text-pink-900">
                {goals.yearlyBookGoal || goals.yearlyPageGoal ? "Editar Metas" : "Definir Metas"}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="book-goal" className="text-pink-900">
                  Meta anual de livros
                </Label>
                <Input
                  id="book-goal"
                  type="number"
                  min="1"
                  placeholder="Ex: 24 livros por ano"
                  value={formData.yearlyBookGoal}
                  onChange={(e) => setFormData({ ...formData, yearlyBookGoal: e.target.value })}
                  className="h-12 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                />
                <p className="text-xs text-pink-600/70">
                  Quantos livros você quer ler este ano?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-goal" className="text-pink-900">
                  Meta anual de páginas
                </Label>
                <Input
                  id="page-goal"
                  type="number"
                  min="1"
                  placeholder="Ex: 10000 páginas por ano"
                  value={formData.yearlyPageGoal}
                  onChange={(e) => setFormData({ ...formData, yearlyPageGoal: e.target.value })}
                  className="h-12 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                />
                <p className="text-xs text-pink-600/70">
                  Quantas páginas você quer ler este ano?
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-300/50 rounded-xl"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-pulse" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Metas
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Tips */}
        {!goals.yearlyBookGoal && !goals.yearlyPageGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-pink-900 mb-2">Dicas para definir suas metas</h3>
                  <ul className="text-sm text-pink-700/80 space-y-1">
                    <li>• Comece com metas realistas baseadas no seu histórico</li>
                    <li>• Uma meta popular é 1 livro por mês (12 livros/ano)</li>
                    <li>• A média de um livro é 250-350 páginas</li>
                    <li>• Você pode ajustar suas metas a qualquer momento</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}