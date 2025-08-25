'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const loadOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products (
          name,
          images
        )
      `)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error loading order items:', error);
    } else {
      setOrderItems(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const openOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage customer orders and fulfillment</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.order_number}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.profiles?.name || 'Guest'}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
                          <DialogDescription>
                            Order placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedOrder && (
                          <div className="space-y-6">
                            {/* Order Status Update */}
                            <div className="flex items-center space-x-4">
                              <label>Update Status:</label>
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Customer Information */}
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <p><strong>Name:</strong> {selectedOrder.profiles?.name || 'Guest'}</p>
                                    <p><strong>Email:</strong> {selectedOrder.email}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tax:</span>
                                      <span>${selectedOrder.tax_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Shipping:</span>
                                      <span>${selectedOrder.shipping_amount.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.discount_amount > 0 && (
                                      <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                      <span>Total:</span>
                                      <span>${selectedOrder.total_amount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Order Items */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Order Items</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {orderItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                                      {item.products?.images?.[0] ? (
                                        <img
                                          src={item.products.images[0]}
                                          alt={item.product_name}
                                          className="w-16 h-16 rounded object-cover"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                          <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <h4 className="font-medium">{item.product_name}</h4>
                                        <p className="text-sm text-gray-500">SKU: {item.product_sku || 'N/A'}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">Qty: {item.quantity}</p>
                                        <p className="text-sm text-gray-500">
                                          ${item.price.toFixed(2)} each
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            {selectedOrder.shipping_address && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-1">
                                    <p>{selectedOrder.shipping_address.name}</p>
                                    <p>{selectedOrder.shipping_address.line1}</p>
                                    {selectedOrder.shipping_address.line2 && (
                                      <p>{selectedOrder.shipping_address.line2}</p>
                                    )}
                                    <p>
                                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                                    </p>
                                    <p>{selectedOrder.shipping_address.country}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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