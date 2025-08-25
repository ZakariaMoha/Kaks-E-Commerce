'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [inStock, setInStock] = useState(false);
  const [featured, setFeatured] = useState(false);
  
  useEffect(() => {
    // Initialize filters from URL params
    const categoryParam = searchParams.get('categories');
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 100
      ]);
    }
    
    setInStock(searchParams.get('in_stock') === 'true');
    setFeatured(searchParams.get('featured') === 'true');
  }, [searchParams]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    
    if (priceRange[0] > 0) {
      params.set('min_price', priceRange[0].toString());
    }
    
    if (priceRange[1] < 100) {
      params.set('max_price', priceRange[1].toString());
    }
    
    if (inStock) {
      params.set('in_stock', 'true');
    }
    
    if (featured) {
      params.set('featured', 'true');
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100]);
    setInStock(false);
    setFeatured(false);
    router.push('/shop');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100 || inStock || featured;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </h3>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange([value[0], value[1]])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$100+</span>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={inStock}
                onCheckedChange={(checked) => setInStock(checked === true)}
              />
              <label
                htmlFor="in-stock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                In Stock Only
              </label>
            </div>
          </div>

          {/* Featured Products */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Special</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setFeatured(checked === true)}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Featured Products
              </label>
            </div>
          </div>

          <Button onClick={updateFilters} className="w-full bg-green-600 hover:bg-green-700">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return category ? (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                    {category.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => toggleCategory(categoryId)}
                    />
                  </Badge>
                ) : null;
              })}
              
              {(priceRange[0] > 0 || priceRange[1] < 100) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setPriceRange([0, 100])}
                  />
                </Badge>
              )}
              
              {inStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  In Stock
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setInStock(false)}
                  />
                </Badge>
              )}
              
              {featured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Featured
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setFeatured(false)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}