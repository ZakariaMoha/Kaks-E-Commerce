import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
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
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('id', currentProductId)
    .limit(4);

  return products || [];
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found - Kaks Naturals'
    };
  }

  return {
    title: `${product.name} - Kaks Naturals`,
    description: product.description || `${product.name} from Kaks Naturals premium collection`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images || [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <Footer />
    </div>
  );
}