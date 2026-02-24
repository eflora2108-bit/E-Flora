import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  gradient?: boolean;
}

export const StatsCard = ({ title, value, subtitle, icon, trend, gradient }: StatsCardProps) => {
  if (gradient) {
    return (
      <div className="bg-gradient-to-br from-primary-500 to-emerald-400 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 card-hover">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/80">{title}</span>
          {icon && <div className="p-2 bg-white/20 rounded-xl">{icon}</div>}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <div className="text-sm text-white/70">{subtitle}</div>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-white' : 'text-red-200'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </div>
  );
};
