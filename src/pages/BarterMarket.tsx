import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, User, Star, Wheat, ShoppingCart, Plus, IndianRupee, Scale, Package } from 'lucide-react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  price_per_kg: number;
  quantity_available: number;
  unit: string;
  quality_grade: string;
  harvest_date: string;
  seller_name: string;
  seller_location: string;
  seller_phone: string;
  image_url?: string;
  description: string;
  organic: boolean;
}

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  seller_name: string;
}

// Import real images
import basmatiRiceImg from '@/assets/basmati-rice.jpg';
import tomatoesImg from '@/assets/tomatoes.jpg';
import wheatGrainImg from '@/assets/wheat-grain.jpg';

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Basmati Rice',
    category: 'Grains',
    price_per_kg: 120,
    quantity_available: 500,
    unit: 'kg',
    quality_grade: 'A+',
    harvest_date: '2024-01-15',
    seller_name: 'Rajesh Kumar',
    seller_location: 'Punjab',
    seller_phone: '+91 98765 43210',
    description: 'Premium quality basmati rice, aged for 2 years',
    organic: true,
    image_url: basmatiRiceImg
  },
  {
    id: '2',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price_per_kg: 25,
    quantity_available: 200,
    unit: 'kg',
    quality_grade: 'A',
    harvest_date: '2024-01-20',
    seller_name: 'Priya Sharma',
    seller_location: 'Maharashtra',
    seller_phone: '+91 87654 32109',
    description: 'Fresh red tomatoes, perfect for cooking',
    organic: false,
    image_url: tomatoesImg
  },
  {
    id: '3',
    name: 'Organic Wheat',
    category: 'Grains',
    price_per_kg: 35,
    quantity_available: 1000,
    unit: 'kg',
    quality_grade: 'A+',
    harvest_date: '2024-01-10',
    seller_name: 'Amit Singh',
    seller_location: 'Haryana',
    seller_phone: '+91 76543 21098',
    description: 'Certified organic wheat, pesticide-free',
    organic: true,
    image_url: wheatGrainImg
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    product_name: 'Premium Basmati Rice',
    quantity: 50,
    total_amount: 6000,
    status: 'delivered',
    created_at: '2024-01-18',
    seller_name: 'Rajesh Kumar'
  }
];

export default function BarterMarket() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, profile } = useDemoAuth();
  const { toast } = useToast();

  const categories = ['all', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async (product: Product, qty: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a purchase",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = product.price_per_kg * qty;

    try {
      // Import Razorpay dynamically
      const { createRazorpayPayment, RAZORPAY_KEY } = await import('@/lib/razorpay');
      
      const options = {
        key: RAZORPAY_KEY,
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'FarmTech - Barter Market',
        description: `Purchase of ${qty}kg ${product.name}`,
        prefill: {
          name: profile?.name || 'Farmer',
          email: user.email || '',
          contact: profile?.phone || '9999999999'
        },
        theme: {
          color: '#22c55e'
        },
        handler: async (response: any) => {
          // Payment successful
          const newOrder: Order = {
            id: Date.now().toString(),
            product_name: product.name,
            quantity: qty,
            total_amount: totalAmount,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            seller_name: product.seller_name
          };

          setOrders(prev => [newOrder, ...prev]);
          
          // Update product quantity
          setProducts(prev => prev.map(p => 
            p.id === product.id 
              ? { ...p, quantity_available: p.quantity_available - qty }
              : p
          ));

          toast({
            title: "Purchase Successful!",
            description: `Successfully purchased ${qty}kg of ${product.name} for ₹${totalAmount}`
          });

          setSelectedProduct(null);
          setQuantity(1);
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled",
              variant: "destructive"
            });
          }
        }
      };

      await createRazorpayPayment(options);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      seller_name: profile?.name || 'Unknown Farmer',
      seller_location: profile?.location || 'Unknown Location',
      seller_phone: profile?.phone || '+91 99999 99999'
    };

    setProducts(prev => [newProduct, ...prev]);
    setShowAddProduct(false);
    toast({
      title: "Product Listed!",
      description: "Your product has been successfully listed in the market"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🌾 Farmer's Barter Market
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Buy and sell fresh produce directly from farmers with secure payments
          </p>
        </div>

        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="my-orders">My Orders</TabsTrigger>
            <TabsTrigger value="sell">Sell Products</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search products or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={product.image_url || '/src/assets/wheat-grain.jpg'} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge variant={product.organic ? "default" : "secondary"}>
                        {product.organic ? 'Organic' : 'Regular'}
                      </Badge>
                      <Badge variant="outline">{product.quality_grade}</Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {product.name}
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                        <span className="text-sm">4.5</span>
                      </div>
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        {product.seller_name}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {product.seller_location}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Package className="h-4 w-4 mr-2" />
                        {product.quantity_available} kg available
                      </div>

                      <div className="flex items-center text-sm text-green-600">
                        <Scale className="h-4 w-4 mr-2" />
                        Harvested: {new Date(product.harvest_date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <div className="text-xl font-bold text-primary">
                      ₹{product.price_per_kg}/{product.unit}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedProduct(product)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Buy Now
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Purchase {selectedProduct?.name}</DialogTitle>
                          <DialogDescription>
                            Complete your purchase with secure payment
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label>Quantity (kg)</Label>
                            <Input
                              type="number"
                              min="1"
                              max={selectedProduct?.quantity_available}
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                          </div>

                          {/* Cost Summary */}
                          {selectedProduct && (
                            <div className="bg-secondary/20 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span>Price per kg:</span>
                                <span>₹{selectedProduct.price_per_kg}</span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span>Quantity:</span>
                                <span>{quantity} kg</span>
                              </div>
                              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                                <span>Total Amount:</span>
                                <span>₹{selectedProduct.price_per_kg * quantity}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button 
                            onClick={() => selectedProduct && handlePurchase(selectedProduct, quantity)}
                            className="w-full"
                          >
                            <IndianRupee className="mr-2 h-4 w-4" />
                            Pay ₹{selectedProduct ? selectedProduct.price_per_kg * quantity : 0}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-orders">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">My Orders</h2>
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet. Start shopping!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {order.product_name}
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-semibold">{order.quantity} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-semibold">₹{order.total_amount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seller</p>
                            <p className="font-semibold">{order.seller_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Order Date</p>
                            <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sell">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6">List Your Products</h2>
              <ProductForm onSubmit={handleAddProduct} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price_per_kg: '',
    quantity_available: '',
    quality_grade: 'A',
    harvest_date: '',
    description: '',
    organic: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price_per_kg: parseFloat(formData.price_per_kg),
      quantity_available: parseInt(formData.quantity_available),
      unit: 'kg'
    });
    // Reset form
    setFormData({
      name: '',
      category: '',
      price_per_kg: '',
      quantity_available: '',
      quality_grade: 'A',
      harvest_date: '',
      description: '',
      organic: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>List your produce for other farmers to purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Pulses">Pulses</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price per kg (₹)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.price_per_kg}
                onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
              />
            </div>
            <div>
              <Label>Quantity Available (kg)</Label>
              <Input
                type="number"
                required
                value={formData.quantity_available}
                onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quality Grade</Label>
              <Select value={formData.quality_grade} onValueChange={(value) => setFormData({...formData, quality_grade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+ Premium</SelectItem>
                  <SelectItem value="A">A Grade</SelectItem>
                  <SelectItem value="B">B Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Harvest Date</Label>
              <Input
                type="date"
                required
                value={formData.harvest_date}
                onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your product quality, farming methods, etc."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="organic"
              checked={formData.organic}
              onChange={(e) => setFormData({...formData, organic: e.target.checked})}
            />
            <Label htmlFor="organic">Organic/Pesticide-free</Label>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            List Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}