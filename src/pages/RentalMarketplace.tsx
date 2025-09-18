import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Truck, Star, Filter, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import ListMachineryModal from '@/components/machinery/ListMachineryModal';
import RentMachineryModal from '@/components/machinery/RentMachineryModal';
import MyRentals from '@/components/machinery/MyRentals';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';

interface Machinery {
  id: string;
  name: string;
  type: string;
  owner: string;
  location: string;
  pricePerDay: number;
  rating: number;
  available: boolean;
  image: string;
  description: string;
  specs: string[];
}

// Import real images
import tractorImg from '@/assets/green-tractor.jpg';
import machineryImg from '@/assets/machinery.jpg';
import bullocksImg from '@/assets/bullocks.jpg';
import irrigationImg from '@/assets/irrigation-pipes.jpg';
import plowImg from '@/assets/plow-equipment.jpg';
import pumpImg from '@/assets/water-pump.jpg';

const machineryData: Machinery[] = [
  {
    id: '1',
    name: 'John Deere 5050D Tractor',
    type: 'tractor',
    owner: 'राम शर्मा',
    location: 'Pune, Maharashtra',
    pricePerDay: 1200,
    rating: 4.8,
    available: true,
    image: tractorImg,
    description: '50 HP tractor perfect for medium farms',
    specs: ['50 HP', '4WD', 'Power Steering', 'Front Loader']
  },
  {
    id: '2',
    name: 'Working Bullocks Pair',
    type: 'livestock',
    owner: 'किसान भाई',
    location: 'Solapur, Maharashtra',
    pricePerDay: 800,
    rating: 4.9,
    available: true,
    image: bullocksImg,
    description: 'Strong pair of trained bullocks for traditional farming',
    specs: ['Trained Bulls', 'Healthy', 'Experienced', 'Traditional Farming']
  },
  {
    id: '3',
    name: 'Irrigation Pipe System',
    type: 'irrigation',
    owner: 'Priya Nair',
    location: 'Kochi, Kerala',
    pricePerDay: 300,
    rating: 4.6,
    available: true,
    image: irrigationImg,
    description: 'Complete drip irrigation system with pipes',
    specs: ['500m Pipes', 'Drip System', 'Sprinklers', 'Connectors']
  },
  {
    id: '4',
    name: 'Water Pump Motor',
    type: 'equipment',
    owner: 'अमित पटेल',
    location: 'Nashik, Maharashtra',
    pricePerDay: 450,
    rating: 4.5,
    available: true,
    image: pumpImg,
    description: 'High capacity water pump for irrigation',
    specs: ['5 HP Motor', 'High Flow Rate', 'Fuel Efficient', 'Portable']
  },
  {
    id: '5',
    name: 'Mahindra 575 DI Tractor',
    type: 'tractor',
    owner: 'Harpreet Singh',
    location: 'Ludhiana, Punjab',
    pricePerDay: 1000,
    rating: 4.7,
    available: true,
    image: tractorImg,
    description: 'Reliable tractor for paddy fields',
    specs: ['47 HP', '2WD', 'Hydraulic Steering', 'PTO']
  },
  {
    id: '6',
    name: 'Plowing Equipment Set',
    type: 'equipment',
    owner: 'मनोज यादव',
    location: 'Indore, Madhya Pradesh',
    pricePerDay: 600,
    rating: 4.4,
    available: false,
    image: plowImg,
    description: 'Complete soil preparation equipment',
    specs: ['Multiple Plows', 'Disc Harrow', 'Cultivator', 'Heavy Duty']
  },
  {
    id: '7',
    name: 'Combine Harvester',
    type: 'harvester',
    owner: 'गुरदीप सिंह',
    location: 'Amritsar, Punjab',
    pricePerDay: 2500,
    rating: 4.9,
    available: true,
    image: machineryImg,
    description: 'Modern combine harvester for wheat',
    specs: ['6 feet cutting width', 'Grain tank', 'Threshing unit', 'GPS Ready']
  },
  {
    id: '8',
    name: 'Rotavator',
    type: 'equipment',
    owner: 'रवि कुमार',
    location: 'Jaipur, Rajasthan',
    pricePerDay: 400,
    rating: 4.3,
    available: true,
    image: machineryImg,
    description: 'Soil preparation and mixing equipment',
    specs: ['7 feet width', 'Heavy duty blades', 'Adjustable depth', 'PTO Driven']
  }
];

export default function RentalMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{
    isOpen: boolean;
    paymentDetails: any;
  }>({ isOpen: false, paymentDetails: null });
  const { toast } = useToast();
  const { user } = useDemoAuth();

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccess = (event: any) => {
      setPaymentSuccessModal({
        isOpen: true,
        paymentDetails: event.detail
      });
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    return () => window.removeEventListener('paymentSuccess', handlePaymentSuccess);
  }, []);

  const filteredMachinery = machineryData.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || machine.type === filterType;
    const matchesLocation = filterLocation === 'all' || machine.location.includes(filterLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleBookMachinery = (machinery: Machinery) => {
    if (!machinery.available) {
      toast({
        title: "Not Available",
        description: "This equipment is currently not available for booking.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      // Create a custom event to open login modal
      const event = new CustomEvent('openLoginModal');
      document.getElementById('root')?.dispatchEvent(event);
      return;
    }

    setSelectedMachinery(machinery);
    setRentModalOpen(true);
  };

  const handleMachineryAdded = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success!",
      description: "Your equipment has been listed successfully."
    });
  };

  const handleRentSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🚜 Farm Rental Marketplace
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Rent tractors, bullocks, irrigation equipment & farming tools with secure payments
          </p>
          <div className="mt-4">
            <ListMachineryModal onMachineryAdded={handleMachineryAdded} />
          </div>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse">Browse Equipment</TabsTrigger>
            <TabsTrigger value="rentals">My Rentals</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">

            {/* Search and Filters */}
            <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tractor">Tractors</SelectItem>
                <SelectItem value="livestock">Bullocks & Livestock</SelectItem>
                <SelectItem value="irrigation">Irrigation Equipment</SelectItem>
                <SelectItem value="harvester">Harvesters</SelectItem>
                <SelectItem value="equipment">Other Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Kerala">Kerala</SelectItem>
                <SelectItem value="Punjab">Punjab</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Select Dates
            </Button>
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachinery.map((machinery) => (
            <Card key={machinery.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={machinery.image} 
                  alt={machinery.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  variant={machinery.available ? "default" : "secondary"}
                  className="absolute top-2 right-2"
                >
                  {machinery.available ? "Available" : "Booked"}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {machinery.name}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                    <span className="text-sm">{machinery.rating}</span>
                  </div>
                </CardTitle>
                <CardDescription>{machinery.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {machinery.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 mr-2" />
                    Owner: {machinery.owner}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {machinery.specs.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <div className="text-xl font-bold text-primary">
                  ₹{machinery.pricePerDay}/day
                </div>
                <Button 
                  onClick={() => handleBookMachinery(machinery)}
                  disabled={!machinery.available}
                  variant={machinery.available ? "default" : "secondary"}
                >
                  {machinery.available ? "Rent Now" : "Not Available"}
                </Button>
              </CardFooter>
                </Card>
              ))}
            </div>

            {filteredMachinery.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No equipment found matching your criteria.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rentals">
            <MyRentals />
          </TabsContent>
        </Tabs>

        {/* Payment Success Modal */}
        {paymentSuccessModal.isOpen && (
          <PaymentSuccessModal
            isOpen={paymentSuccessModal.isOpen}
            onClose={() => setPaymentSuccessModal({ isOpen: false, paymentDetails: null })}
            paymentDetails={paymentSuccessModal.paymentDetails}
          />
        )}

        {/* Rent Machinery Modal */}
        <RentMachineryModal
          machinery={selectedMachinery}
          open={rentModalOpen}
          onClose={() => {
            setRentModalOpen(false);
            setSelectedMachinery(null);
          }}
          onRentSuccess={handleRentSuccess}
        />
      </div>
    </div>
  );
}