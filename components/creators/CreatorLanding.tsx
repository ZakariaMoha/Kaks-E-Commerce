'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Instagram, 
  Youtube, 
  Share2,
  CheckCircle,
  Gift,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function CreatorLanding() {
  const [promoCode, setPromoCode] = useState('');
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('code', promoCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error || !promo) {
        toast.error('Promo code not found or inactive');
        setPromoDetails(null);
        return;
      }

      setPromoDetails(promo);
      toast.success('Promo code found!');
    } catch (error) {
      console.error('Error checking promo code:', error);
      toast.error('Failed to check promo code');
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = () => {
    if (promoDetails) {
      // Store promo code for checkout
      localStorage.setItem('appliedPromoCode', JSON.stringify(promoDetails));
      toast.success('Promo code saved! It will be applied at checkout.');
      
      // Redirect to shop
      window.location.href = '/shop';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">
          <Star className="w-4 h-4 mr-2" />
          Creator Program
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Partner with <span className="text-green-600">Kaks Naturals</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Join our exclusive creator community and earn rewards by sharing premium natural products 
          with your audience. Get unique promo codes, exclusive perks, and grow together with us.
        </p>
        
        {/* Promo Code Checker */}
        <Card className="max-w-md mx-auto mb-8 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-center">Have a Creator Code?</CardTitle>
            <CardDescription className="text-center">
              Enter your creator's promo code to unlock exclusive discounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="text-center font-mono"
              />
              <Button onClick={checkPromoCode} disabled={loading}>
                {loading ? 'Checking...' : 'Check'}
              </Button>
            </div>
            
            {promoDetails && (
              <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Valid Code!</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Creator: <strong>{promoDetails.profiles?.name || 'Anonymous'}</strong>
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {promoDetails.type === 'percentage' 
                      ? `${promoDetails.value}% OFF` 
                      : `$${promoDetails.value} OFF`
                    }
                  </p>
                  {promoDetails.min_order_amount && (
                    <p className="text-xs text-gray-500">
                      Min order: ${promoDetails.min_order_amount}
                    </p>
                  )}
                </div>
                <Button onClick={applyPromoCode} className="w-full bg-green-600 hover:bg-green-700">
                  Apply Code & Shop Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Earn Commission</h3>
            <p className="text-gray-600 mb-4">
              Get competitive commission rates on every sale generated through your unique promo codes.
            </p>
            <Badge variant="secondary">Up to 20% Commission</Badge>
          </CardContent>
        </Card>

        <Card className="text-center border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Exclusive Products</h3>
            <p className="text-gray-600 mb-4">
              Get early access to new products and exclusive creator-only items before they launch.
            </p>
            <Badge variant="secondary">VIP Access</Badge>
          </CardContent>
        </Card>

        <Card className="text-center border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Track Performance</h3>
            <p className="text-gray-600 mb-4">
              Access detailed analytics dashboard to track your earnings and optimize performance.
            </p>
            <Badge variant="secondary">Real-time Analytics</Badge>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '1',
              title: 'Apply to Join',
              description: 'Submit your application with your social media profiles and audience demographics.',
              icon: <Users className="w-8 h-8 text-green-600" />
            },
            {
              step: '2',
              title: 'Get Approved',
              description: 'Our team reviews your application and approves creators who align with our brand.',
              icon: <CheckCircle className="w-8 h-8 text-green-600" />
            },
            {
              step: '3',
              title: 'Receive Your Code',
              description: 'Get your unique promo code and access to creator resources and product samples.',
              icon: <Gift className="w-8 h-8 text-green-600" />
            },
            {
              step: '4',
              title: 'Start Earning',
              description: 'Share your code with your audience and start earning commission on every sale.',
              icon: <TrendingUp className="w-8 h-8 text-green-600" />
            }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Creator Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
            <div className="text-gray-600">Earned by Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
            <div className="text-gray-600">Average Commission</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">Creator Support</div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Creators Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              handle: '@sarahwellness',
              platform: 'Instagram',
              followers: '125K',
              quote: 'Kaks Naturals has been amazing to work with. The products are genuinely great and my audience loves them!',
              earnings: '$3,200/month'
            },
            {
              name: 'Mike Chen',
              handle: '@mikefitness',
              platform: 'YouTube',
              followers: '89K',
              quote: 'The analytics dashboard is incredibly detailed. I can track exactly which content drives the most sales.',
              earnings: '$2,800/month'
            },
            {
              name: 'Emma Davis',
              handle: '@emmastyle',
              platform: 'TikTok',
              followers: '200K',
              quote: 'Great commission rates and the team is super supportive. Highly recommend joining their creator program!',
              earnings: '$4,500/month'
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      {testimonial.platform === 'Instagram' && <Instagram className="w-4 h-4 mr-1" />}
                      {testimonial.platform === 'YouTube' && <Youtube className="w-4 h-4 mr-1" />}
                      {testimonial.platform === 'TikTok' && <Share2 className="w-4 h-4 mr-1" />}
                      {testimonial.handle} • {testimonial.followers}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 text-green-800">
                    Earning {testimonial.earnings}
                  </Badge>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-900 text-white rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Join Our Creator Family?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Start earning with premium natural products your audience will love. 
          Apply now and become part of the Kaks Naturals creator community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
            Apply Now
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
            Learn More
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-6">
          Questions? Email us at <a href="mailto:creators@kaksnaturals.com" className="text-green-400 hover:underline">creators@kaksnaturals.com</a>
        </p>
      </div>
    </div>
  );
}