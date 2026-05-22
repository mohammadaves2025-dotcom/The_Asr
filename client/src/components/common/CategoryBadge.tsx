import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import type { Category } from '../../types';

interface Props {
  category: Category | { name: string; slug: string; color: string };
  size?: 'xs' | 'sm';
  linked?: boolean;
  className?: string;
}

export default function CategoryBadge({ category, size = 'sm', linked = true, className }: Props) {
  const baseClass = cn(
    'font-sans font-bold uppercase tracking-widest inline-block',
    size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
    className
  );

  const style = {
    backgroundColor: category.color + '18',
    color: category.color,
    borderLeft: `2px solid ${category.color}`,
  };

  if (linked) {
    return (
      <Link to={`/category/${category.slug}`} className={baseClass} style={style}>
        {category.name}
      </Link>
    );
  }

  return (
    <span className={baseClass} style={style}>
      {category.name}
    </span>
  );
}
