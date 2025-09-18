import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, User, Phone, Clock, CreditCard } from 'lucide-react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Rental {
  id: string;
  machineryName: string;
  machineryImage: string;
  owner: string;
  ownerPhone: string;
  location: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'upcoming' | 'cancelled';
  paymentMode: 'real' | 'dummy';
  notes?: string;
}

// Demo rental data
const myRentals: Rental[] = [
  {
    id: '1',
    machineryName: 'John Deere 5050D',
    machineryImage: '/src/assets/green-tractor.jpg',
    owner: 'राम शर्मा',
    ownerPhone: '+91-9876543210',
    location: 'Pune, Maharashtra',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    totalAmount: 7200,
    status: 'active',
    paymentMode: 'dummy',
    notes: 'Need for plowing 5 acres'
  },
  {
    id: '2',
    machineryName: 'Combine Harvester',
    machineryImage: '/src/assets/plow-equipment.jpg',
    owner: 'Harpreet Singh',
    ownerPhone: '+91-9876543212',
    location: 'Ludhiana, Punjab',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    totalAmount: 9000,
    status: 'completed',
    paymentMode: 'real'
  },
  {
    id: '3',
    machineryName: 'Rotavator',
    machineryImage: '/src/assets/water-pump.jpg',
    owner: 'अमित पटेल',
    ownerPhone: '+91-9876543213',
    location: 'Nashik, Maharashtra', 
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    totalAmount: 1440,
    status: 'upcoming',
    paymentMode: 'dummy',
    notes: 'Soil preparation for winter crop'
  }
];

export default function MyRentals() {
  const { user } = useDemoAuth();
  const { toast } = useToast();
  const [rentals] = useState<Rental[]>(myRentals);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'upcoming': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCancelRental = (rentalId: string) => {
    toast({
      title: "Rental Cancelled",
      description: "Your rental has been cancelled. Refund will be processed within 3-5 business days.",
    });
  };

  const handleContactOwner = (phone: string) => {
    // In a real app, this could open a phone dialer or messaging app
    toast({
      title: "Contact Info",
      description: `Owner's phone: ${phone}`,
    });
  };

  const filterRentalsByStatus = (status: string) => {
    if (status === 'all') return rentals;
    return rentals.filter(rental => rental.status === status);
  };

  const RentalCard = ({ rental }: { rental: Rental }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <img 
              src={rental.machineryImage} 
              alt={rental.machineryName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <CardTitle className="text-lg">{rental.machineryName}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {rental.owner}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {rental.location}
                </div>
              </div>
            </div>
          </div>
          <Badge 
            className={`${getStatusColor(rental.status)} text-white capitalize`}
          >
            {rental.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{rental.startDate} to {rental.endDate}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>₹{rental.totalAmount} ({rental.paymentMode === 'real' ? 'Paid' : 'Demo'})</span>
            </div>

            {rental.notes && (
              <div className="text-sm text-muted-foreground">
                <strong>Notes:</strong> {rental.notes}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleContactOwner(rental.ownerPhone)}
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
            
            {rental.status === 'upcoming' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCancelRental(rental.id)}
                className="w-full text-red-600 hover:text-red-700"
              >
                Cancel Rental
              </Button>
            )}
            
            {rental.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Extend Rental
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Please login to view your rentals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Rentals</h2>
        <p className="text-muted-foreground">
          Manage your machinery rentals and track their status
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {rentals.map(rental => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filterRentalsByStatus('active').map(rental => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filterRentalsByStatus('upcoming').map(rental => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterRentalsByStatus('completed').map(rental => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterRentalsByStatus('cancelled').map(rental => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </TabsContent>
      </Tabs>

      {rentals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No rentals found. Start by renting some machinery!
          </p>
        </div>
      )}
    </div>
  );
}