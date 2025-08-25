'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface CartItem {
  id?: string;
  product_id: string;
  quantity: number;
  product?: any;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    if (session?.user) {
      // Load authenticated user's cart
      const { data: cart } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items (
            id,
            quantity,
            product_id,
            products (
              id,
              name,
              slug,
              price,
              compare_at_price,
              images,
              stock_quantity
            )
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (cart?.cart_items) {
        const items = cart.cart_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: item.products
        }));
        setCartItems(items);
      }
    } else {
      // Load guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setCartItems(guestCart);
    }
    
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (user) {
      // Update authenticated user's cart
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
        return;
      }
    } else {
      // Update guest cart
      const guestCart = cartItems.map(item => 
        item.product_id === itemId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }

    setCartItems(items => 
      items.map(item => 
        (item.id === itemId || item.product_id === itemId) 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      // Remove from authenticated user's cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item');
        return;
      }
    } else {
      // Remove from guest cart
      const guestCart = cartItems.filter(item => item.product_id !== itemId);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }

    setCartItems(items => items.filter(item => 
      item.id !== itemId && item.product_id !== itemId
    ));
    toast.success('Item removed from cart');
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error || !promo) {
        toast.error('Invalid promo code');
        return;
      }

      // Check if promo code is still valid
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        toast.error('Promo code has expired');
        return;
      }

      // Check usage limit
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        toast.error('Promo code usage limit reached');
        return;
      }

      const subtotal = calculateSubtotal();

      // Check minimum order amount
      if (promo.min_order_amount && subtotal < promo.min_order_amount) {
        toast.error(`Minimum order of $${promo.min_order_amount.toFixed(2)} required`);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (promo.type === 'percentage') {
        discount = subtotal * (promo.value / 100);
        if (promo.max_discount && discount > promo.max_discount) {
          discount = promo.max_discount;
        }
      } else {
        discount = promo.value;
      }

      setAppliedPromo(promo);
      setPromoDiscount(discount);
      toast.success('Promo code applied!');
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Failed to apply promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href="/shop">
              Continue Shopping
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal - promoDiscount);
  const shipping = calculateShipping();
  const total = subtotal - promoDiscount + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/shop">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id || item.product_id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link 
                          href={`/products/${item.product?.slug}`}
                          className="hover:text-green-600"
                        >
                          {item.product?.name}
                        </Link>
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-green-600">
                          Ksh {item.product?.price?.toFixed(2)}
                        </span>
                        {item.product?.compare_at_price && (
                          <span className="text-sm text-gray-500 line-through">
                            Ksh {item.product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id || item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-4 py-2 min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id || item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product?.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id || item.product_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Ksh {((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-Ksh {promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Ksh {tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Ksh ${shipping.toFixed(2)}`}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Ksh {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium">
                      {appliedPromo.code} applied
                    </span>
                    <Button variant="ghost" size="sm" onClick={removePromoCode}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button onClick={applyPromoCode} variant="outline">
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button 
              asChild 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              size="lg"
            >
              <Link href="/checkout">
                Proceed to Checkout
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}