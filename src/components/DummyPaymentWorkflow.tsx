import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Shield,
  Smartphone
} from 'lucide-react';

interface DummyPaymentWorkflowProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
}

type PaymentStep = 'method' | 'details' | 'otp' | 'processing' | 'success';

export default function DummyPaymentWorkflow({ 
  open, 
  onClose, 
  amount, 
  description, 
  onSuccess 
}: DummyPaymentWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [progress, setProgress] = useState(0);
  const [otp, setOtp] = useState('');
  const { toast } = useToast();

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: '',
    upiId: ''
  });

  const steps: Record<PaymentStep, number> = {
    method: 25,
    details: 50,
    otp: 75,
    processing: 90,
    success: 100
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI Payment', icon: Smartphone },
  ];

  const handleMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setTimeout(() => {
      setCurrentStep('details');
      setProgress(steps.details);
    }, 500);
  };

  const handleDetailsSubmit = () => {
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cvv || !paymentDetails.name) {
        toast({
          title: "Missing Details",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        toast({
          title: "Missing UPI ID",
          description: "Please enter your UPI ID",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep('otp');
    setProgress(steps.otp);
  };

  const handleOtpSubmit = () => {
    if (otp !== '123456') {
      toast({
        title: "Invalid OTP",
        description: "Please enter correct OTP (hint: 123456)",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('processing');
    setProgress(steps.processing);

    // Simulate payment processing
    setTimeout(() => {
      setCurrentStep('success');
      setProgress(steps.success);
      setTimeout(() => {
        onSuccess();
        resetWorkflow();
      }, 2000);
    }, 3000);
  };

  const resetWorkflow = () => {
    setCurrentStep('method');
    setPaymentMethod('');
    setProgress(0);
    setOtp('');
    setPaymentDetails({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      name: '',
      upiId: ''
    });
    onClose();
  };

  const goBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('method');
      setProgress(steps.method);
    } else if (currentStep === 'otp') {
      setCurrentStep('details');
      setProgress(steps.details);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetWorkflow}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Amount Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <p className="text-2xl font-bold text-primary">₹{amount}</p>
                </div>
                <Badge variant="secondary">Demo Payment</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          {currentStep === 'method' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Choose Payment Method</h3>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <method.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Payment Details */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">Payment Details</h3>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, cardNumber: e.target.value}))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry Month</Label>
                      <Select value={paymentDetails.expiryMonth} onValueChange={(value) => setPaymentDetails(prev => ({...prev, expiryMonth: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => (
                            <SelectItem key={i+1} value={String(i+1).padStart(2, '0')}>
                              {String(i+1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Expiry Year</Label>
                      <Select value={paymentDetails.expiryYear} onValueChange={(value) => setPaymentDetails(prev => ({...prev, expiryYear: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 10}, (_, i) => (
                            <SelectItem key={i} value={String(2024 + i)}>
                              {2024 + i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        placeholder="123"
                        maxLength={3}
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails(prev => ({...prev, cvv: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={paymentDetails.name}
                        onChange={(e) => setPaymentDetails(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>UPI ID</Label>
                    <Input
                      placeholder="yourname@paytm"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, upiId: e.target.value}))}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleDetailsSubmit} className="w-full">
                Continue to Payment
              </Button>
            </div>
          )}

          {/* OTP Verification */}
          {currentStep === 'otp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">OTP Verification</h3>
              </div>

              <div className="text-center space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm">
                    We've sent a 6-digit OTP to your registered mobile number
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo OTP: <strong>123456</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button onClick={handleOtpSubmit} disabled={otp.length !== 6} className="w-full">
                  Verify & Pay
                </Button>
              </div>
            </div>
          )}

          {/* Processing */}
          {currentStep === 'processing' && (
            <div className="text-center space-y-4 py-8">
              <div className="animate-spin">
                <Clock className="h-12 w-12 mx-auto text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">
                  Please do not close this window
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {currentStep === 'success' && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <h3 className="font-semibold text-green-600">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: DEMO{Date.now()}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}