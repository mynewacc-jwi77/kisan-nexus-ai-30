import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Mic, 
  MicOff,
  Play,
  Pause,
  Volume2,
  Languages,
  Sparkles,
  ArrowRight,
  Brain,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import heroImage from "@/assets/hero-farm.jpg";

export default function HeroSection() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useDemoAuth();
  const isAuthenticated = !!user;

  const languages = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi"];

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for your commands...",
      });
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        toast({
          title: "Voice Command Received",
          description: "Processing your request...",
        });
      }, 3000);
    } else {
      toast({
        title: "Voice Assistant Stopped",
        description: "Voice recognition disabled.",
      });
    }
  };

  const toggleLanguage = () => {
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
    toast({
      title: "Language Changed",
      description: `Switched to ${languages[nextIndex]}`,
    });
  };

  const startDemo = () => {
    setIsPlaying(true);
    toast({
      title: "Demo Started",
      description: "Showcasing platform features...",
    });
    setTimeout(() => {
      setIsPlaying(false);
      navigate("/disease-detection");
    }, 2000);
  };

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0"> 
        <img 
          src={heroImage} 
          alt="Modern farming landscape" 
          className="w-full h-full object-cover" 
        /> 
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" /> 
      </div>
      
      <div className="container relative z-10 px-6 py-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Agriculture Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
                स्मार्ट खेती का
                <span className="block">Digital भविष्य</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                AI से सशक्त होकर बेहतर फसल उगाएं। रोग पहचान, मौसम विश्लेषण, और कृषि सलाह 
                आपकी भाषा में पाएं।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/disease-detection")}
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Disease Detection
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => {
                    // Trigger login modal - find the app component
                    const appRoot = document.getElementById('root');
                    if (appRoot) {
                      const event = new CustomEvent('openLoginModal');
                      appRoot.dispatchEvent(event);
                    }
                  }}
                >
                  <User className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/80">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-white/80">Disease Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12+</div>
                <div className="text-sm text-white/80">Indian Languages</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src={heroImage} 
                alt="Smart farming with AI technology" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-400/30 rounded-full animate-bounce delay-300" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400/30 rounded-full animate-bounce delay-700" />
          </div>
        </div>

        {/* Enhanced Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Disease Detection</h3>
              <p className="text-gray-600 text-sm">
                Upload crop photos for instant AI-powered disease identification with 95% accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Assistant</h3>
              <p className="text-gray-600 text-sm">
                Get farming advice in 12+ Indian languages using our multilingual voice AI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Weather</h3>
              <p className="text-gray-600 text-sm">
                Real-time weather insights and crop recommendations for optimal farming decisions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}