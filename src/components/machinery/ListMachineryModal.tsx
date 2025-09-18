import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { Plus, Upload, X } from 'lucide-react';

interface ListMachineryModalProps {
  onMachineryAdded: () => void;
}

export default function ListMachineryModal({ onMachineryAdded }: ListMachineryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useDemoAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    pricePerDay: '',
    location: '',
    specs: [] as string[],
    images: [] as string[]
  });
  
  const [newSpec, setNewSpec] = useState('');

  const machineryTypes = [
    { value: 'tractor', label: 'Tractor' },
    { value: 'harvester', label: 'Harvester' },
    { value: 'plough', label: 'Plough' },
    { value: 'seeder', label: 'Seeder' },
    { value: 'sprayer', label: 'Sprayer' },
    { value: 'rotavator', label: 'Rotavator' },
    { value: 'cultivator', label: 'Cultivator' },
    { value: 'other', label: 'Other Equipment' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to list machinery.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call to create machinery listing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Machinery Listed Successfully!",
        description: `${formData.name} has been added to the marketplace.`
      });
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        description: '',
        pricePerDay: '',
        location: '',
        specs: [],
        images: []
      });
      
      setOpen(false);
      onMachineryAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list machinery. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => {
    if (newSpec.trim() && !formData.specs.includes(newSpec.trim())) {
      setFormData(prev => ({
        ...prev,
        specs: [...prev.specs, newSpec.trim()]
      }));
      setNewSpec('');
    }
  };

  const removeSpec = (specToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter(spec => spec !== specToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          List Your Machinery
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List Your Machinery for Rent</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Machinery Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., John Deere 5050D"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select machinery type" />
                </SelectTrigger>
                <SelectContent>
                  {machineryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Day (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: e.target.value }))}
                placeholder="1000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your machinery, its condition, and any special features..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Specifications</Label>
            <div className="flex gap-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="e.g., 50 HP, 4WD, Power Steering"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
              />
              <Button type="button" onClick={addSpec} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specs.map((spec, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeSpec(spec)}>
                  {spec}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload machinery images (Coming soon)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Listing..." : "List Machinery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}