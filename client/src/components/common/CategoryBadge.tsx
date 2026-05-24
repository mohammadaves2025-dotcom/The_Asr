import { Link } from 'react-router-dom';
import type { Category } from '../../types';

interface Props {
  category: Category;
  size?: 'xs' | 'sm' | 'md';
  asLink?: boolean;
}

export default function CategoryBadge({ category, size = 'sm', asLink = true }: Props) {
  const cls = `inline-block font-black uppercase font-sans ${
    size === 'xs' ? 'text-[8px] tracking-[1.5px] px-1.5 py-0.5' :
    size === 'sm' ? 'text-[9px] tracking-[2px] px-2 py-0.5' :
    'text-[10px] tracking-[2px] px-2.5 py-1'
  } text-brand-red hover:text-brand-red-dark transition-colors`;

  if (!asLink) return <span className={cls}>{category.name}</span>;
  return (
    <Link to={`/category/${category.slug}`} className={cls} onClick={e => e.stopPropagation()}>
      {category.name}
    </Link>
  );
}
