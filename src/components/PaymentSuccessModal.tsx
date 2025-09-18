import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Share, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: {
    paymentId: string;
    amount: number;
    itemName: string;
    currency?: string;
  };
}

export default function PaymentSuccessModal({ isOpen, onClose, paymentDetails }: PaymentSuccessModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show success animation after a short delay
      const timer = setTimeout(() => setShowDetails(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowDetails(false);
    }
  }, [isOpen]);

  const handleDownloadReceipt = () => {
    // Simulate receipt download
    const receiptData = `
FARMER CONNECT - PAYMENT RECEIPT
====================================
Payment ID: ${paymentDetails.paymentId}
Item: ${paymentDetails.itemName}
Amount: ₹${paymentDetails.amount}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Status: SUCCESS
Payment Method: UPI
====================================
Thank you for using Farmer Connect!
`;
    
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentDetails.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Successful - Farmer Connect',
          text: `Successfully paid ₹${paymentDetails.amount} for ${paymentDetails.itemName} via Farmer Connect`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Payment successful! ₹${paymentDetails.amount} paid for ${paymentDetails.itemName}`);
      alert('Payment details copied to clipboard!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Payment Successful</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6 py-4">
          {/* Success Animation */}
          <div className={`mx-auto transition-all duration-500 ${showDetails ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
              <div className="absolute inset-0 h-20 w-20 border-4 border-green-200 rounded-full animate-ping"></div>
            </div>
          </div>

          <div className={`space-y-2 transition-all duration-700 delay-300 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground">Your payment has been processed successfully</p>
          </div>

          {/* Payment Details */}
          <div className={`bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg space-y-3 transition-all duration-700 delay-500 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment ID:</span>
              <span className="font-mono text-sm">{paymentDetails.paymentId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Item:</span>
              <span className="text-sm font-medium">{paymentDetails.itemName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid:</span>
              <span className="text-lg font-bold text-green-600">₹{paymentDetails.amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="text-sm font-medium text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                SUCCESS
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-700 delay-700 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadReceipt}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="flex-1"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Rate your experience</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform" />
                ))}
              </div>
            </div>

            <Button onClick={onClose} className="w-full bg-gradient-primary">
              Continue
            </Button>
          </div>

          {/* Additional Info */}
          <div className={`text-xs text-muted-foreground transition-all duration-700 delay-900 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p>You will receive a confirmation email shortly.</p>
            <p>For support, contact us at support@farmerconnect.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}