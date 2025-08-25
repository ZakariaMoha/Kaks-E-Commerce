'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock_quantity: number;
  featured: boolean;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const addToCart = async (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', productId);
  };

  const addToWishlist = async (productId: string) => {
    // TODO: Implement add to wishlist functionality
    console.log('Add to wishlist:', productId);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
        
        <div className="flex items-center space-x-4">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
            <option>Best Selling</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <Link href={`/products/${product.slug}`}>
                  <Image
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {product.featured && (
                    <Badge className="bg-green-600 text-white">Featured</Badge>
                  )}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <Badge variant="destructive">
                      -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => addToWishlist(product.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button asChild className="bg-white text-black hover:bg-gray-100">
                      <Link href={`/products/${product.slug}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-2">
                  {product.categories && (
                    <Badge variant="secondary" className="text-xs">
                      {product.categories.name}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  <Link href={`/products/${product.slug}`} className="hover:text-green-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">(24)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>

                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Only {product.stock_quantity} left in stock!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}