'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingBag, Star, Minus, Plus, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock_quantity: number;
  weight?: number;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder-product.jpg'];

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const addToCart = async () => {
    setAddingToCart(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Handle guest cart in localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = guestCart.find((item: any) => item.product_id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          guestCart.push({
            product_id: product.id,
            product: product,
            quantity: quantity
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        toast.success('Added to cart!');
      } else {
        // Handle authenticated user cart
        // First, get or create cart
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!cart) {
          const { data: newCart, error: cartError } = await supabase
            .from('carts')
            .insert({ user_id: session.user.id })
            .select('id')
            .single();

          if (cartError) throw cartError;
          cart = newCart;
        }

        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', product.id)
          .single();

        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);

          if (error) throw error;
        } else {
          // Add new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: product.id,
              quantity: quantity
            });

          if (error) throw error;
        }

        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-green-600">Shop</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link 
              href={`/categories/${product.categories.slug}`} 
              className="hover:text-green-600"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-green-600' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.categories && (
              <Badge variant="secondary" className="mb-2">
                {product.categories.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">(24 reviews)</span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="text-3xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </div>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <div className="text-xl text-gray-500 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </div>
                  <Badge variant="destructive">Save {discount}%</Badge>
                </>
              )}
            </div>

            {product.description && (
              <div className="prose prose-gray max-w-none mb-6">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="border-0 w-16 text-center"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {product.stock_quantity > 0 ? (
                  <span className={product.stock_quantity <= 5 ? 'text-orange-600' : ''}>
                    {product.stock_quantity} left in stock
                  </span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={addToCart}
                disabled={product.stock_quantity === 0 || addingToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={toggleWishlist}
                className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="outline" size="lg" onClick={shareProduct}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Product Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-5 h-5 text-green-600" />
              <span className="text-sm">30-day return policy</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm">1-year warranty included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <Image
                        src={relatedProduct.images?.[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ${relatedProduct.price.toFixed(2)}
                        </span>
                        {relatedProduct.compare_at_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${relatedProduct.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}