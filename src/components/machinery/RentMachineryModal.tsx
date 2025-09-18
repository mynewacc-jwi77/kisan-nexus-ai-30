import { useState } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { CalendarIcon, CreditCard, Wallet, MapPin, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import DummyPaymentWorkflow from '@/components/DummyPaymentWorkflow';
import { createRazorpayPayment, RAZORPAY_KEY } from '@/lib/razorpay';

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

interface RentMachineryModalProps {
  machinery: Machinery | null;
  open: boolean;
  onClose: () => void;
  onRentSuccess: () => void;
}

export default function RentMachineryModal({ machinery, open, onClose, onRentSuccess }: RentMachineryModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'real' | 'dummy'>('dummy');
  const [loading, setLoading] = useState(false);
  const [showPaymentWorkflow, setShowPaymentWorkflow] = useState(false);
  const { user } = useDemoAuth();
  const { toast } = useToast();

  if (!machinery) return null;

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalAmount = totalDays * machinery.pricePerDay;
  const securityDeposit = Math.round(totalAmount * 0.2); // 20% security deposit
  const finalAmount = totalAmount + securityDeposit;

  const handleRent = async () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please login to rent machinery.",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Select Dates",
        description: "Please select start and end dates for the rental.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (paymentMode === 'real') {
        // Create Razorpay payment session
        await createRazorpayRealPayment();
      } else {
        // Show dummy payment workflow
        setShowPaymentWorkflow(true);
        setLoading(false);
        return;
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRazorpayRealPayment = async () => {
    try {
      await createRazorpayPayment({
        key: RAZORPAY_KEY,
        amount: finalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Krishi Mitr',
        description: `Rental for ${machinery.name}`,
        prefill: {
          name: 'Farmer',
          email: user?.email || '',
          contact: '9999999999'
        },
        theme: {
          color: '#10b981'
        },
        handler: (response: any) => {
          toast({
            title: "Payment Successful!",
            description: `Payment ID: ${response.razorpay_payment_id}. Your rental for ${machinery.name} has been confirmed.`
          });
          resetAndClose();
          onRentSuccess();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive"
            });
          }
        }
      });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const processDummyPayment = async () => {
    // Simulate dummy payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Rental Confirmed! (Demo Mode)",
      description: `Your demo rental for ${machinery.name} has been confirmed. Total: ₹${finalAmount}`
    });
    
    resetAndClose();
    onRentSuccess();
  };

  const resetAndClose = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
    setPaymentMode('dummy');
    setShowPaymentWorkflow(false);
    onClose();
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: `Your rental for ${machinery.name} has been confirmed. Booking details will be sent shortly.`
    });
    resetAndClose();
    onRentSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rent {machinery.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Machinery Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={machinery.image} 
                  alt={machinery.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{machinery.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {machinery.owner}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {machinery.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {machinery.specs.slice(0, 3).map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    ₹{machinery.pricePerDay}/day
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration and Pricing */}
          {startDate && endDate && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </span>
                    <span className="font-medium">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rental Cost</span>
                    <span>₹{machinery.pricePerDay} × {totalDays} = ₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Security Deposit (20%)</span>
                    <span>₹{securityDeposit}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{finalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Mode */}
          <div className="space-y-3">
            <Label>Payment Mode</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-mode"
                  checked={paymentMode === 'real'}
                  onCheckedChange={(checked) => setPaymentMode(checked ? 'real' : 'dummy')}
                />
                <Label htmlFor="payment-mode" className="cursor-pointer">
                  Real Payment
                </Label>
              </div>
              <Badge variant={paymentMode === 'real' ? 'default' : 'secondary'}>
                {paymentMode === 'real' ? (
                  <><CreditCard className="h-3 w-3 mr-1" /> Real Payment</>
                ) : (
                  <><Wallet className="h-3 w-3 mr-1" /> Demo Mode</>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {paymentMode === 'real' 
                ? "You will be charged the actual amount using Razorpay (UPI/Cards/Net Banking)."
                : "Demo mode - No actual payment will be processed."
              }
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes for the owner..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            {/* Demo Success Button for Judges */}
            <Button 
              variant="secondary"
              onClick={() => {
                toast({
                  title: "Payment Successful! (Demo)",
                  description: `Demo payment of ₹${finalAmount} completed successfully for ${machinery.name}`,
                });
                resetAndClose();
                onRentSuccess();
              }}
              className="min-w-[140px]"
            >
              Demo Success ✓
            </Button>
            <Button 
              onClick={handleRent} 
              disabled={loading || !startDate || !endDate}
              className="min-w-[120px]"
            >
              {loading ? "Processing..." : `Pay ₹${finalAmount}`}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dummy Payment Workflow */}
      <DummyPaymentWorkflow
        open={showPaymentWorkflow}
        onClose={() => setShowPaymentWorkflow(false)}
        amount={finalAmount}
        description={`Rental for ${machinery?.name}`}
        onSuccess={handlePaymentSuccess}
      />
    </Dialog>
  );
}