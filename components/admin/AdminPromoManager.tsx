'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Percent, DollarSign, Copy, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPromoManager() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    creator_id: '',
    valid_until: '',
    status: 'active'
  });

  useEffect(() => {
    loadPromoCodes();
    loadCreators();
  }, []);

  const loadPromoCodes = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select(`
        *,
        profiles (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Failed to load promo codes');
    } else {
      setPromoCodes(data || []);
    }
    setLoading(false);
  };

  const loadCreators = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'creator');

    if (error) {
      console.error('Error loading creators:', error);
    } else {
      setCreators(data || []);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      creator_id: '',
      valid_until: '',
      status: 'active'
    });
    setEditingPromo(null);
  };

  const generatePromoCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const openDialog = (promo?: any) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code || '',
        type: promo.type || 'percentage',
        value: promo.value?.toString() || '',
        min_order_amount: promo.min_order_amount?.toString() || '',
        max_discount: promo.max_discount?.toString() || '',
        usage_limit: promo.usage_limit?.toString() || '',
        creator_id: promo.creator_id || '',
        valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : '',
        status: promo.status || 'active'
      });
    } else {
      resetForm();
      generatePromoCode();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const promoData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        creator_id: formData.creator_id || null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        status: formData.status
      };

      let error;
      
      if (editingPromo) {
        const { error: updateError } = await supabase
          .from('promo_codes')
          .update(promoData)
          .eq('id', editingPromo.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('promo_codes')
          .insert(promoData);
        error = insertError;
      }

      if (error) {
        console.error('Error saving promo code:', error);
        toast.error('Failed to save promo code');
      } else {
        toast.success(`Promo code ${editingPromo ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        resetForm();
        loadPromoCodes();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Invalid form data');
    }
  };

  const deletePromoCode = async (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting promo code:', error);
        toast.error('Failed to delete promo code');
      } else {
        toast.success('Promo code deleted successfully');
        loadPromoCodes();
      }
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div>Loading promo codes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Promo Codes
            </CardTitle>
            <CardDescription>Manage promotional codes and creator partnerships</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                </DialogTitle>
                <DialogDescription>
                  {editingPromo ? 'Update promo code details' : 'Set up a new promotional code'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      required
                      placeholder="Enter code"
                    />
                    <Button type="button" variant="outline" onClick={generatePromoCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {formData.type === 'percentage' ? 'Percentage' : 'Amount ($)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="creator_id">Assign to Creator (Optional)</Label>
                  <Select value={formData.creator_id} onValueChange={(value) => setFormData(prev => ({ ...prev, creator_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a creator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific creator</SelectItem>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.name} ({creator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_order_amount">Min Order ($)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      step="0.01"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="valid_until">Expires At (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPromo ? 'Update Code' : 'Create Code'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                      {promo.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPromoCode(promo.code)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {promo.type === 'percentage' ? (
                      <Percent className="w-3 h-3 mr-1" />
                    ) : (
                      <DollarSign className="w-3 h-3 mr-1" />
                    )}
                    {promo.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {promo.type === 'percentage' 
                    ? `${promo.value}%` 
                    : `$${promo.value.toFixed(2)}`
                  }
                  {promo.max_discount && promo.type === 'percentage' && (
                    <div className="text-xs text-gray-500">
                      Max: ${promo.max_discount.toFixed(2)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {promo.profiles?.name || 'General'}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{promo.usage_count || 0} used</div>
                    {promo.usage_limit && (
                      <div className="text-gray-500">
                        / {promo.usage_limit} limit
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(promo.status)}>
                    {promo.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(promo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePromoCode(promo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}