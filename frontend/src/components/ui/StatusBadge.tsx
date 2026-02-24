interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  'under-review': 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700',
};

export const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const style = statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold capitalize ${style} ${sizeClass}`}>
      {status}
    </span>
  );
};
