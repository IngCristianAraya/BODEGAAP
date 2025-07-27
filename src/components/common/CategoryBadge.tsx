import React from 'react';
import { categoryData } from '@/lib/constants/categoryData';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  size?: number;
  showAbbr?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = '',
  size = 18,
  showAbbr = false,
}) => {
  const data = categoryData[category as keyof typeof categoryData] || categoryData['all'];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium text-xs ${className}`}
      title={category}
    >
      <span className="text-lg" style={{ lineHeight: 1 }}>
        {data.icon}
      </span>
      {showAbbr ? data.abbr : category}
    </span>
  );
};

export default CategoryBadge;
