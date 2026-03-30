import { React } from "react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  progress?: number; // 0-100
  progressLabel?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  progress,
  progressLabel 
}: StatsCardProps) {
  return (
    <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-pink-200 dark:border-slate-700 hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-slate-900/50 transition-all rounded-2xl">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-pink-700/80 dark:text-slate-400 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0 ml-2 shadow-md">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">{progressLabel || "Progresso"}</span>
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-slate-200 dark:bg-slate-700" />
        </div>
      )}
      
      {description && (
        <p className="text-xs text-pink-600/70 dark:text-slate-400">{description}</p>
      )}
    </Card>
  );
}