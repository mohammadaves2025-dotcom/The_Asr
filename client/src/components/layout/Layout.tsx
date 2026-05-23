import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import Footer from './Footer';
import { categoriesService } from '../../services/articles';

export default function Layout() {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const categories = data?.data?.data?.categories || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
