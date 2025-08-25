import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Heart, Star, ShoppingBag, Users, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20" />
        <div className="relative max-w-6xl mx-auto">
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
            <Leaf className="w-4 h-4 mr-2" />
            100% Natural & Organic
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Pure Nature,
            <span className="text-green-600 block">Pure Beauty</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the transformative power of nature with our premium skincare and wellness collection. 
            Crafted with love, designed for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
              <Link href="/shop">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Collection
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg">
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most loved products, carefully selected for their exceptional quality and results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Natural Glow Serum",
                price: "Ksh 4,999",
                image: "https://images.pexels.com/photos/4465829/pexels-photo-4465829.jpeg",
                rating: 4.9,
                reviews: 127
              },
              {
                name: "Hydrating Face Cream",
                price: "Ksh 3,499",
                image: "https://images.pexels.com/photos/4465624/pexels-photo-4465624.jpeg",
                rating: 4.8,
                reviews: 89
              },
              {
                name: "Wellness Tea Blend",
                price: "Ksh 2,499",
                image: "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg",
                rating: 4.7,
                reviews: 156
              }
            ].map((product, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-white/90 text-green-700">
                      Featured
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{product.price}</span>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Kaks Naturals?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the finest natural products with exceptional quality and care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-12 h-12 text-green-600" />,
                title: "100% Natural",
                description: "All our products are made with carefully selected natural and organic ingredients."
              },
              {
                icon: <Award className="w-12 h-12 text-green-600" />,
                title: "Premium Quality",
                description: "We maintain the highest standards of quality in every product we create."
              },
              {
                icon: <Heart className="w-12 h-12 text-green-600" />,
                title: "Made with Love",
                description: "Every product is crafted with passion and care for your wellbeing."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-md bg-white">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Collaboration CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-100 to-emerald-100">
            <CardContent className="p-12">
              <Users className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner with Us</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our creator community and share exclusive promo codes with your audience. 
                Earn rewards while promoting natural wellness.
              </p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                <Link href="/creators">Become a Creator Partner</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}