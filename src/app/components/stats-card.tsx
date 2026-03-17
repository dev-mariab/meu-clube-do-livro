import { React } from "react";
import { Card } from "./ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-pink-200 hover:shadow-xl hover:shadow-pink-200/50 transition-all rounded-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-pink-700/80 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">{value}</p>
          {description && (
            <p className="text-xs text-pink-600/70">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 ml-2 shadow-md">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
        </div>
      </div>
    </Card>
  );
}