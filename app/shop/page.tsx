import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

export const metadata = {
  title: 'Shop - Kaks Naturals',
  description: 'Browse our complete collection of premium natural skincare, wellness products, and lifestyle essentials.',
};

async function getProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];
}

async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop All Products</h1>
          <p className="text-lg text-gray-600">
            Discover our complete collection of premium natural products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ProductFilters categories={categories} />
            </Suspense>
          </aside>
          
          <main className="lg:w-3/4">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid products={products} />
            </Suspense>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}