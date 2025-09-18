import React, { useState } from 'react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Sprout, Loader2, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp, loading } = useDemoAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: 'India'
  });

  const resetForm = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '', phone: '', location: 'India' });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (!error) {
      toast({
        title: "Login Successful",
        description: "Welcome back to Farmer Connect!",
      });
      onClose();
      resetForm();
    } else {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone || !registerForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (registerForm.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(registerForm.email, registerForm.password, {
      name: registerForm.name,
      phone: registerForm.phone,
      location: registerForm.location
    });
    
    if (!error) {
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
      onClose();
      resetForm();
    } else {
      // Handle specific error cases
      let errorTitle = "Registration Failed";
      let errorMessage = error.message;
      
      if (error.message.includes('email') && error.message.includes('invalid')) {
        errorTitle = "Invalid Email";
        errorMessage = "Please use a valid email address (e.g., user@example.com)";
      } else if (error.message.includes('User already registered')) {
        errorTitle = "Account Exists";
        errorMessage = "This email is already registered. Please try logging in instead.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  // Demo accounts for quick testing
  const demoAccounts = [
    { email: 'farmer@demo.com', password: 'farmer123', name: 'Demo Farmer' },
    { email: 'admin@demo.com', password: 'admin123', name: 'Demo Admin' }
  ];

  const handleDemoLogin = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      toast({
        title: "Demo Login Successful",
        description: `Welcome ${name}!`,
      });
      onClose();
    } else {
      // If demo account doesn't exist, create it
      const { error: signUpError } = await signUp(email, password, {
        name: name
      });
      
      if (!signUpError) {
        toast({
          title: "Demo Account Created",
          description: `Demo account created for ${name}. Please check your email to verify.`,
        });
        onClose();
      } else {
        toast({
          title: "Demo Login Failed",
          description: "Please try manual login instead.",
          variant: "destructive"
        });
      }
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Farmer Connect</CardTitle>
          <CardDescription>
            Join thousands of farmers using smart agriculture solutions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </div>

              {/* Demo Accounts */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3 text-center">Quick Demo Login</p>
                <div className="space-y-2">
                  {demoAccounts.map((account, index) => (
                    <div 
                      key={index}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => handleDemoLogin(account.email, account.password, account.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Demo</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+91-9876543210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-location">Location</Label>
                  <Input
                    id="register-location"
                    type="text"
                    placeholder="City, State"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({...registerForm, location: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={handleRegister} 
                  className="w-full" 
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}