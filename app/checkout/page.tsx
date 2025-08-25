'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';

interface CartItem {
  id?: string;
  product_id: string;
  quantity: number;
  product?: any;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    saveAddress: false,
    billingSameAsShipping: true,
    paymentMethod: 'card'
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user) {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setFormData(prev => ({
          ...prev,
          email: profile.email,
          firstName: profile.name?.split(' ')[0] || '',
          lastName: profile.name?.split(' ').slice(1).join(' ') || ''
        }));
      }

      // Load cart items
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

  const generateOrderNumber = () => {
    return 'KN' + Date.now().toString().slice(-8);
  };

  const processOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal - promoDiscount);
      const shipping = calculateShipping();
      const total = subtotal - promoDiscount + tax + shipping;

      const orderData = {
        order_number: generateOrderNumber(),
        user_id: user?.id || null,
        email: formData.email,
        status: 'pending',
        payment_status: 'pending',
        subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        discount_amount: promoDiscount,
        total_amount: total,
        promo_code_id: appliedPromo?.id || null,
        shipping_address: {
          name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.address1,
          line2: formData.address2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        billing_address: formData.billingSameAsShipping ? {
          name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.address1,
          line2: formData.address2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        } : null
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
        product_name: item.product.name,
        product_sku: item.product.sku || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update promo code usage if applicable
      if (appliedPromo) {
        await supabase
          .from('promo_codes')
          .update({ usage_count: appliedPromo.usage_count + 1 })
          .eq('id', appliedPromo.id);
      }

      // Clear cart
      if (user) {
        await supabase
          .from('cart_items')
          .delete()
          .in('id', cartItems.map(item => item.id).filter(Boolean));
      } else {
        localStorage.removeItem('guestCart');
      }

      // In a real app, integrate with Stripe here
      // For demo purposes, we'll mark as paid
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', order.id);

      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setProcessing(false);
    }
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
    router.push('/cart');
    return null;
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
            <Link href="/cart">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center text-gray-500">
            <Lock className="w-4 h-4 mr-1" />
            Secure Checkout
          </div>
        </div>

        <form onSubmit={processOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address1">Address</Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                      required
                      placeholder="1234 Main St"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                      placeholder="Apt 1A"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        required
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        required
                        placeholder="90210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Credit / Debit Card
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Lock className="w-4 h-4 inline mr-1" />
                      For demo purposes, this order will be automatically processed as paid.
                      In production, this would integrate with Stripe for secure payment processing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id || item.product_id} className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                            alt={item.product?.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product?.name}</p>
                        </div>
                        <div className="text-sm font-medium">
                          Ksh {((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Ksh {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
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
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : `Place Order • Ksh ${total.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By placing your order, you agree to our{' '}
                    <Link href="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}