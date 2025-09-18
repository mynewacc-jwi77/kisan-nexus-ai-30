import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Brain, 
  Loader2, 
  Camera,
  Send,
  Upload,
  X,
  Languages,
  MessageSquare,
  Headphones,
  Sparkles,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiAI } from '@/lib/gemini';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
  audio?: boolean;
}

interface EnhancedFarmingAssistantProps {
  onQuery?: (query: string, type: 'text' | 'voice' | 'image', language: string) => void;
}

export default function EnhancedFarmingAssistant({ onQuery }: EnhancedFarmingAssistantProps) {
  const [mode, setMode] = useState<'chat' | 'voice' | 'image'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: getLocalizedResponse('welcome'),
      timestamp: new Date()
    };
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [selectedLanguage]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी', locale: 'hi-IN' },
    { code: 'marathi', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN' },
    { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN' },
    { code: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
    { code: 'english', name: 'English', nativeName: 'English', locale: 'en-IN' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "Voice Recognition Started",
          description: "Speak now...",
        });
      };

      recognitionInstance.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        handleVoiceQuery(speechResult);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [selectedLanguage]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'assistant', image?: string, audio?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      image,
      audio
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleTextQuery = async () => {
    if (!inputText.trim()) return;

    const query = inputText;
    setInputText('');
    addMessage(query, 'user');
    setIsProcessing(true);

    try {
      const response = await processQuery(query, 'text');
      addMessage(response, 'assistant');
      speakResponse(response);
      
      if (onQuery) {
        onQuery(query, 'text', selectedLanguage);
      }
    } catch (error) {
      console.error('Error processing text query:', error);
      const fallbackResponse = "I'm sorry, I couldn't process your request right now. Please try again.";
      addMessage(fallbackResponse, 'assistant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    addMessage(query, 'user', undefined, true);
    setIsProcessing(true);

    try {
      const response = await processQuery(query, 'voice');
      addMessage(response, 'assistant');
      speakResponse(response);
      
      if (onQuery) {
        onQuery(query, 'voice', selectedLanguage);
      }
    } catch (error) {
      console.error('Error processing voice query:', error);
      const fallbackResponse = "I'm sorry, I couldn't process your voice query right now.";
      addMessage(fallbackResponse, 'assistant');
      speakResponse(fallbackResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageQuery = async () => {
    if (!imageFile || !inputText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an image and enter a question about it.",
        variant: "destructive"
      });
      return;
    }

    const query = inputText;
    setInputText('');
    addMessage(query, 'user', selectedImage || undefined);
    setIsProcessing(true);

    try {
      const response = await processImageQuery(query, imageFile);
      addMessage(response, 'assistant');
      speakResponse(response);
      
      if (onQuery) {
        onQuery(query, 'image', selectedLanguage);
      }
      
      // Clear image selection
      setSelectedImage(null);
      setImageFile(null);
    } catch (error) {
      console.error('Error processing image query:', error);
      const fallbackResponse = "I'm sorry, I couldn't analyze the image right now. Please try again.";
      addMessage(fallbackResponse, 'assistant');
    } finally {
      setIsProcessing(false);
    }
  };

  const processQuery = async (query: string, type: 'text' | 'voice'): Promise<string> => {
    try {
      setApiError(false);
      const advice = await geminiAI.getFarmingAdvice(query, selectedLanguage);
      return advice.response;
    } catch (error) {
      console.error('Gemini API error:', error);
      setApiError(true);
      
      // Show helpful error info
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        toast({
          title: "AI Service Temporarily Unavailable",
          description: "Using our offline farming knowledge base instead",
          variant: "default"
        });
      }
      
      return getFallbackResponse(query);
    }
  };

  const processImageQuery = async (query: string, image: File): Promise<string> => {
    try {
      setApiError(false);
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string;
            const aiResult = await geminiAI.analyzeCropImage(base64);
            const response = formatImageAnalysisResponse(aiResult, query);
            resolve(response);
          } catch (error) {
            console.error('AI image analysis error:', error);
            setApiError(true);
            reject(error);
          }
        };
        reader.readAsDataURL(image);
      });
    } catch (error) {
      console.error('Image processing error:', error);
      setApiError(true);
      
      toast({
        title: "AI Image Analysis Unavailable",
        description: "Using our visual assessment guide instead",
        variant: "default"
      });
      
      return getLocalizedResponse('disease_analysis');
    }
  };

  const formatImageAnalysisResponse = (analysis: any, query: string): string => {
    const responses: Record<string, string> = {
      hindi: `विश्लेषण परिणाम: ${analysis.disease}\nविश्वास स्तर: ${analysis.confidence}%\nगंभीरता: ${analysis.severity}\n\nउपचार:\n${analysis.treatment.join('\n')}\n\nबचाव:\n${analysis.prevention.join('\n')}`,
      english: `Analysis Result: ${analysis.disease}\nConfidence: ${analysis.confidence}%\nSeverity: ${analysis.severity}\n\nTreatment:\n${analysis.treatment.join('\n')}\n\nPrevention:\n${analysis.prevention.join('\n')}`,
      marathi: `विश्लेषण परिणाम: ${analysis.disease}\nविश्वास: ${analysis.confidence}%\nगंभीरता: ${analysis.severity}\n\nउपचार:\n${analysis.treatment.join('\n')}\n\nप्रतिबंध:\n${analysis.prevention.join('\n')}`
    };

    return responses[selectedLanguage] || responses['english'];
  };

  const getFallbackResponse = (query: string): string => {
    const queryLower = query.toLowerCase();
    
    // Enhanced fallback logic with more comprehensive responses
    if (queryLower.includes('weather') || queryLower.includes('मौसम') || queryLower.includes('पाऊस') || queryLower.includes('rain') || queryLower.includes('climate')) {
      return getLocalizedResponse('weather');
    } else if (queryLower.includes('disease') || queryLower.includes('pest') || queryLower.includes('बीमारी') || queryLower.includes('कीड़े') || queryLower.includes('infection')) {
      return getLocalizedResponse('disease_general');
    } else if (queryLower.includes('crop') || queryLower.includes('फसल') || queryLower.includes('पीक') || queryLower.includes('plant') || queryLower.includes('seed')) {
      return getLocalizedResponse('crop');
    } else if (queryLower.includes('fertilizer') || queryLower.includes('खाद') || queryLower.includes('खत') || queryLower.includes('nutrient') || queryLower.includes('manure')) {
      return getLocalizedResponse('fertilizer');
    } else if (queryLower.includes('irrigation') || queryLower.includes('water') || queryLower.includes('सिंचाई') || queryLower.includes('पानी')) {
      return getLocalizedResponse('irrigation');
    } else if (queryLower.includes('harvest') || queryLower.includes('कटाई') || queryLower.includes('yield') || queryLower.includes('production')) {
      return getLocalizedResponse('harvest');
    } else if (queryLower.includes('market') || queryLower.includes('price') || queryLower.includes('sell') || queryLower.includes('बाजार') || queryLower.includes('कीमत')) {
      return getLocalizedResponse('market');
    } else {
      return getLocalizedResponse('default');
    }
  };

  const getLocalizedResponse = (type: string): string => {
    const responses: Record<string, Record<string, string>> = {
      weather: {
        hindi: 'इस मौसम में अपनी फसल की देखभाल के लिए नियमित जल निकासी बनाए रखें। बारिश से पहले कवकनाशी का छिड़काव करें।',
        english: 'During this season, maintain regular drainage for crop care. Apply fungicide spray before rains.',
        marathi: 'या हंगामात पिकांच्या काळजीसाठी नियमित पाणी निचरा राखा. पावसापूर्वी बुरशीनाशकाची फवारणी करा.',
        malayalam: 'ഈ കാലാവസ്ഥയിൽ വിളകളുടെ സംരക്ഷണത്തിനായി ഡ്രെയിനേജ് നിലനിർത്തുക. മഴയ്ക്ക് മുമ്പ് കുമിൾനാശിനി തളിക്കുക.',
        punjabi: 'ਇਸ ਮੌਸਮ ਵਿੱਚ ਫਸਲ ਦੀ ਦੇਖਭਾਲ ਲਈ ਨਿਯਮਤ ਪਾਣੀ ਨਿਕਾਸ ਬਣਾਈ ਰੱਖੋ। ਬਾਰਿਸ਼ ਤੋਂ ਪਹਿਲਾਂ ਫੰਗੀਸਾਈਡ ਸਪ੍ਰੇ ਕਰੋ।'
      },
      crop: {
        hindi: 'आपकी फसल स्वस्थ दिखाई दे रही है। उचित अंतराल पर सिंचाई करें और नियमित रूप से कीट-पतंगों की जांच करते रहें।',
        english: 'Your crop appears healthy. Maintain proper irrigation intervals and regularly check for pests.',
        marathi: 'तुमचे पीक निरोगी दिसत आहे. योग्य अंतराने सिंचन करा आणि नियमितपणे कीटकांची तपासणी करा.',
        malayalam: 'നിങ്ങളുടെ വിള ആരോഗ്യകരമായി കാണപ്പെടുന്നു. ശരിയായ ഇടവേളയിൽ നനയ്ക്കുകയും പ്രാണികളെ പരിശോധിക്കുകയും ചെയ്യുക.',
        punjabi: 'ਤੁਹਾਡੀ ਫਸਲ ਸਿਹਤਮੰਦ ਦਿਖਾਈ ਦਿੰਦੀ ਹੈ। ਸਹੀ ਅੰਤਰਾਲ ਤੇ ਸਿੰਚਾਈ ਕਰੋ ਅਤੇ ਨਿਯਮਤ ਕੀੜਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।'
      },
      fertilizer: {
        hindi: 'मिट्टी परीक्षण के आधार पर NPK (20:20:20) का उपयोग करें। जैविक खाद के साथ रासायनिक उर्वरक मिलाएं।',
        english: 'Use NPK (20:20:20) based on soil testing. Mix chemical fertilizer with organic manure.',
        marathi: 'मातीच्या चाचणीवर आधारित NPK (20:20:20) वापरा. रासायनिक खत सेंद्रिय खताबरोबर मिसळा.',
        malayalam: 'മണ്ണ് പരിശോധനയുടെ അടിസ്ഥാനത്തിൽ NPK (20:20:20) ഉപയോഗിക്കുക. രാസവളം ജൈവവളത്തോടൊപ്പം കലർത്തുക.',
        punjabi: 'ਮਿੱਟੀ ਜਾਂਚ ਦੇ ਆਧਾਰ ਤੇ NPK (20:20:20) ਦਾ ਵਰਤੋਂ ਕਰੋ। ਰਸਾਇਣਕ ਖਾਦ ਨੂੰ ਜੈਵਿਕ ਖਾਦ ਨਾਲ ਮਿਲਾਓ।'
      },
      disease_general: {
        hindi: 'सामान्य रोग नियंत्रण के लिए नीम तेल और कॉपर सल्फेट का मिश्रण उपयोगी है। साप्ताहिक छिड़काव करें।',
        english: 'For general disease control, neem oil and copper sulfate mixture is useful. Apply weekly spray.',
        marathi: 'सामान्य रोग नियंत्रणासाठी कडुनिंबाचे तेल आणि तांब्याचे सल्फेट मिश्रण उपयुक्त आहे. साप्ताहिक फवारणी करा.',
        malayalam: 'സാധാരണ രോഗനിയന്ത്രണത്തിനായി വേപ്പെണ്ണയും ചെമ്പ് സൾഫേറ്റും മിശ്രിതം ഉപയോഗപ്രദമാണ്. പ്രതിവാര സ്പ്രേ ചെയ്യുക.',
        punjabi: 'ਆਮ ਰੋਗ ਨਿਯੰਤਰਣ ਲਈ ਨਿੰਮ ਤੇਲ ਅਤੇ ਕਾਪਰ ਸਲਫੇਟ ਮਿਸ਼ਰਣ ਉਪਯੋਗੀ ਹੈ। ਹਫਤਾਵਾਰੀ ਸਪ੍ਰੇ ਕਰੋ।'
      },
      irrigation: {
        hindi: 'ड्रिप सिंचाई सबसे किफायती है। सुबह या शाम के समय पानी देना बेहतर होता है।',
        english: 'Drip irrigation is most economical. Watering in morning or evening is better.',
        marathi: 'ठिबक सिंचन सर्वात किफायतशीर आहे. सकाळी किंवा संध्याकाळी पाणी देणे चांगले असते.',
        malayalam: 'തുള്ളി നനയ്ക്കൽ ഏറ്റവും ലാഭകരമാണ്. രാവിലെയോ വൈകുന്നേരമോ വെള്ളം നൽകുന്നത് നല്ലതാണ്.',
        punjabi: 'ਡ੍ਰਿਪ ਸਿੰਚਾਈ ਸਭ ਤੋਂ ਮਿਤਵਿਅਯੀ ਹੈ। ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਪਾਣੀ ਦੇਣਾ ਬਿਹਤਰ ਹੈ।'
      },
      harvest: {
        hindi: 'कटाई का सही समय फसल की किस्म पर निर्भर करता है। सुबह जल्दी कटाई करना बेहतर होता है।',
        english: 'Right harvest time depends on crop variety. Early morning harvesting is preferable.',
        marathi: 'कापणीचा योग्य काळ पिकाच्या जातीवर अवलंबून असतो. पहाटे कापणी करणे चांगले असते.',
        malayalam: 'ശരിയായ വിളവെടുപ്പ് സമയം വിള ഇനത്തെ ആശ്രയിച്ചിരിക്കുന്നു. അതിരാവിലെ വിളവെടുപ്പ് നല്ലതാണ്.',
        punjabi: 'ਵਾਢੀ ਦਾ ਸਹੀ ਸਮਾਂ ਫਸਲ ਦੀ ਕਿਸਮ ਤੇ ਨਿਰਭਰ ਕਰਦਾ ਹੈ। ਸਵੇਰੇ ਵਾਢੀ ਕਰਨਾ ਬਿਹਤਰ ਹੈ।'
      },
      market: {
        hindi: 'eNAM पोर्टल पर बाजार भाव देखें। स्थानीय मंडी से संपर्क करके वर्तमान दरें जानें।',
        english: 'Check market prices on eNAM portal. Contact local mandi for current rates.',
        marathi: 'eNAM पोर्टलवर बाजार भाव पाहा. स्थानिक मंडीशी संपर्क करून सध्याचे दर जाणून घ्या.',
        malayalam: 'eNAM പോർട്ടലിൽ മാർക്കറ്റ് വിലകൾ പരിശോധിക്കുക. നിലവിലെ നിരക്കുകൾക്കായി പ്രാദേശിക മണ്ഡിയുമായി ബന്ധപ്പെടുക.',
        punjabi: 'eNAM ਪੋਰਟਲ ਤੇ ਮਾਰਕੀਟ ਰੇਟ ਦੇਖੋ। ਮੌਜੂਦਾ ਦਰਾਂ ਲਈ ਸਥਾਨਕ ਮੰਡੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।'
      },
      disease_analysis: {
        hindi: 'तस्वीर के आधार पर, यह पत्ती में कुछ संक्रमण के लक्षण दिख रहे हैं। कॉपर सल्फेट का छिड़काव करें और पास के कृषि विशेषज्ञ से सलाह लें।',
        english: 'Based on the image, there appear to be some infection symptoms on the leaves. Apply copper sulfate spray and consult with a nearby agricultural expert.',
        marathi: 'चित्राच्या आधारे, पानांवर काही संसर्गाची लक्षणे दिसत आहेत. कॉपर सल्फेटची फवारणी करा आणि जवळच्या कृषी तज्ञांचा सल्ला घ्या.',
        malayalam: 'ചിത്രത്തിന്റെ അടിസ്ഥാനത്തിൽ, ഇലകളിൽ ചില അണുബാധയുടെ ലക്ഷണങ്ങൾ കാണുന്നു. കോപ്പർ സൾഫേറ്റ് സ്പ്രേ ചെയ്ത് അടുത്തുള്ള കൃഷി വിദഗ്ധനെ സമീപിക്കുക.',
        punjabi: 'ਤਸਵੀਰ ਦੇ ਆਧਾਰ ਤੇ, ਪੱਤਿਆਂ ਵਿੱਚ ਕੁਝ ਲਾਗ ਦੇ ਲੱਛਣ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ। ਕਾਪਰ ਸਲਫੇਟ ਸਪ੍ਰੇ ਕਰੋ ਅਤੇ ਨੇੜਲੇ ਖੇਤੀ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਲਓ।'
      },
      crop_health: {
        hindi: 'आपकी फसल की समग्र स्थिति अच्छी है। हरे रंग की पत्तियां और मजबूत तना स्वस्थ विकास दर्शाते हैं।',
        english: 'Overall condition of your crop is good. Green leaves and strong stem indicate healthy growth.',
        marathi: 'तुमच्या पिकाची एकूण स्थिती चांगली आहे. हिरवी पाने आणि मजबूत खोड निरोगी वाढ दर्शविते.',
        malayalam: 'നിങ്ങളുടെ വിളയുടെ മൊത്തത്തിലുള്ള അവസ്ഥ നല്ലതാണ്. പച്ച ഇലകളും ശക്തമായ തണ്ടും ആരോഗ്യകരമായ വളർച്ചയെ സൂചിപ്പിക്കുന്നു.',
        punjabi: 'ਤੁਹਾਡੀ ਫਸਲ ਦੀ ਸਮੁੱਚੀ ਸਥਿਤੀ ਚੰਗੀ ਹੈ। ਹਰੇ ਪੱਤੇ ਅਤੇ ਮਜਬੂਤ ਤਣਾ ਸਿਹਤਮੰਦ ਵਿਕਾਸ ਦਰਸਾਉਂਦੇ ਹਨ।'
      },
      harvest_timing: {
        hindi: 'फसल की परिपक्वता के लक्षण दिख रहे हैं। अगले 7-10 दिनों में कटाई के लिए तैयार रहें।',
        english: 'Signs of crop maturity are visible. Be ready for harvesting in the next 7-10 days.',
        marathi: 'पिकाच्या परिपक्वतेची चिन्हे दिसत आहेत. पुढच्या ७-१० दिवसात कापणीसाठी तयार रहा.',
        malayalam: 'വിള പാകമാകുന്നതിന്റെ ലക്ഷണങ്ങൾ കാണാം. അടുത്ത 7-10 ദിവസത്തിനുള്ളിൽ വിളവെടുപ്പിനു തയ്യാറാകുക.',
        punjabi: 'ਫਸਲ ਪੱਕਣ ਦੇ ਲੱਛਣ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ। ਅਗਲੇ 7-10 ਦਿਨਾਂ ਵਿੱਚ ਵਾਢੀ ਲਈ ਤਿਆਰ ਰਹੋ।'
      },
      general_image: {
        hindi: 'तस्वीर अच्छी गुणवत्ता की है। अधिक विस्तृत सलाह के लिए कृपया अपना प्रश्न और स्पष्ट करें।',
        english: 'The image is of good quality. Please be more specific with your question for detailed advice.',
        marathi: 'चित्र चांगल्या गुणवत्तेचे आहे. तपशीलवार सल्ल्यासाठी कृपया तुमचा प्रश्न अधिक स्पष्ट करा.',
        malayalam: 'ചിത്രം നല്ല നിലവാരത്തിലാണ്. വിശദമായ ഉപദേശത്തിനായി ദയവായി നിങ്ങളുടെ ചോദ്യം കൂടുതൽ വ്യക്തമാക്കുക.',
        punjabi: 'ਤਸਵੀਰ ਚੰਗੀ ਕੁਆਲਿਟੀ ਦੀ ਹੈ। ਵਿਸਤ੍ਰਿਤ ਸਲਾਹ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਹੋਰ ਸਪੱਸ਼ਟ ਕਰੋ।'
      },
      welcome: {
        hindi: '🌾 नमस्कार! मैं आपका AI कृषि सहायक हूँ। मैं फसल, मौसम, बीमारियों और खेती की तकनीकों के बारे में आपकी मदद कर सकता हूँ। आप मुझसे सवाल पूछ सकते हैं, आवाज़ में बात कर सकते हैं, या फसल की तस्वीर भेज सकते हैं।',
        english: '🌾 Hello! I am your AI farming assistant. I can help you with crops, weather, diseases, and farming techniques. You can ask me questions, talk to me using voice, or send crop images for analysis.',
        marathi: '🌾 नमस्कार! मी तुमचा AI शेती सहायक आहे. मी पिके, हवामान, रोग आणि शेती तंत्रज्ञानाबद्दल तुमची मदत करू शकतो. तुम्ही मला प्रश्न विचारू शकता, आवाजातून बोलू शकता किंवा पिकांचे फोटो पाठवू शकता.',
        malayalam: '🌾 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI കൃഷി സഹായകനാണ്. വിളകൾ, കാലാവസ്ഥ, രോഗങ്ങൾ, കൃഷി സാങ്കേതികവിദ്യകൾ എന്നിവയിൽ ഞാൻ നിങ്ങളെ സഹായിക്കാം. നിങ്ങൾക്ക് ചോദ്യങ്ങൾ ചോദിക്കാം, വോയ്സ് ഉപയോഗിച്ച് സംസാരിക്കാം, അല്ലെങ്കിൽ വിള ചിത്രങ്ങൾ അയയ്ക്കാം.',
        punjabi: '🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਫਸਲਾਂ, ਮੌਸਮ, ਬਿਮਾਰੀਆਂ ਅਤੇ ਖੇਤੀ ਤਕਨੀਕਾਂ ਬਾਰੇ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ, ਆਵਾਜ਼ ਵਿੱਚ ਗੱਲ ਕਰ ਸਕਦੇ ਹੋ, ਜਾਂ ਫਸਲ ਦੀਆਂ ਤਸਵੀਰਾਂ ਭੇਜ ਸਕਦੇ ਹੋ।'
      },
      default: {
        hindi: 'नमस्कार! मैं आपकी खेती से जुड़े सवालों का जवाब देने के लिए यहाँ हूँ। कृपया अपना प्रश्न पूछें या कोई तस्वीर साझा करें।',
        english: 'Hello! I am here to answer your farming-related questions. Please ask your question or share an image.',
        marathi: 'नमस्कार! मी तुमच्या शेतीशी संबंधित प्रश्नांची उत्तरे देण्यासाठी येथे आहे. कृपया तुमचा प्रश्न विचारा किंवा चित्र सामायिक करा.',
        malayalam: 'നമസ്കാരം! കൃഷിയുമായി ബന്ധപ്പെട്ട നിങ്ങളുടെ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാൻ ഞാൻ ഇവിടെയുണ്ട്. ദയവായി നിങ്ങളുടെ ചോദ്യം ചോദിക്കുകയോ ഒരു ചിത്രം പങ്കിടുകയോ ചെയ്യുക.',
        punjabi: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੇ ਖੇਤੀ ਨਾਲ ਜੁੜੇ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇਣ ਲਈ ਇੱਥੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ ਜਾਂ ਤਸਵੀਰ ਸਾਂਝੀ ਕਰੋ।'
      },
      sample_weather: {
        hindi: 'इस मौसम में कौन सी फसल लगानी चाहिए?',
        english: 'Which crops should I plant this season?',
        marathi: 'या हंगामात कोणते पीक लावावे?',
        malayalam: 'ഈ സീസണിൽ ഏത് വിളകൾ നടണം?',
        punjabi: 'ਇਸ ਮੌਸਮ ਵਿੱਚ ਕਿਹੜੀ ਫਸਲ ਲਗਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?'
      },
      sample_crop: {
        hindi: 'गेहूं की फसल में पैदावार कैसे बढ़ाएं?',
        english: 'How to increase wheat crop yield?',
        marathi: 'गहूच्या पिकात उत्पादन कसे वाढवावे?',
        malayalam: 'ഗോതമ്പ് വിളവ് എങ്ങനെ വർദ്ധിപ്പിക്കാം?',
        punjabi: 'ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਪੈਦਾਵਾਰ ਕਿਵੇਂ ਵਧਾਈਏ?'
      },
      sample_disease: {
        hindi: 'टमाटर के पत्तों पर धब्बे हैं, क्या करूं?',
        english: 'Tomato leaves have spots, what should I do?',
        marathi: 'टोमॅटोच्या पानांवर डाग आहेत, काय करावे?',
        malayalam: 'തക്കാളി ഇലകളിൽ പാടുകൾ ഉണ്ട്, എന്ത് ചെയ്യണം?',
        punjabi: 'ਟਮਾਟਰ ਦੇ ਪੱਤਿਆਂ ਤੇ ਧੱਬੇ ਹਨ, ਕੀ ਕਰਾਂ?'
      },
      sample_fertilizer: {
        hindi: 'मक्का के लिए कौन सी खाद बेहतर है?',
        english: 'Which fertilizer is better for corn?',
        marathi: 'मक्याच्या पिकासाठी कोणते खत चांगले आहे?',
        malayalam: 'ചോളത്തിന് ഏത് വളം നല്ലത്?',
        punjabi: 'ਮੱਕੀ ਲਈ ਕਿਹੜੀ ਖਾਦ ਬਿਹਤਰ ਹੈ?'
      }
    };

    return responses[type]?.[selectedLanguage] || responses['default'][selectedLanguage] || responses['default']['english'];
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const currentLang = languages.find(lang => lang.code === selectedLanguage);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang?.locale || 'en-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      const currentLang = languages.find(lang => lang.code === selectedLanguage);
      recognition.lang = currentLang?.locale || 'hi-IN';
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 ">
        <CardHeader className="text-center border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            AI Farming Assistant
            <Badge variant="secondary" className="ml-2">
              <Languages className="w-3 h-3 mr-1" />
              {languages.find(l => l.code === selectedLanguage)?.nativeName}
            </Badge>
          </CardTitle>
          
          {apiError && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                AI service temporarily unavailable. Using offline knowledge base.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {/* Mode and Language Selection */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white/70 dark:bg-gray-800/50 rounded-lg border">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={mode === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('chat')}
                className="transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                variant={mode === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('voice')}
                className="transition-all"
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </Button>
              <Button
                variant={mode === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('image')}
                className="transition-all"
              >
                <Camera className="w-4 h-4 mr-2" />
                Image
              </Button>
            </div>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Messages Display */}
          <div className="mb-6 border rounded-lg bg-white dark:bg-gray-900 shadow-inner">
            <div className="h-56 md:h-64 overflow-y-auto p-4">
              {(
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg shadow-sm transition-all ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-4' 
                          : 'bg-gradient-to-br from-muted to-muted/70 mr-4 border border-border/50'
                      }`}>
                        {message.image && (
                          <img 
                            src={message.image} 
                            alt="User uploaded" 
                            className="w-40 h-40 object-cover rounded-lg mb-3 shadow-sm"
                          />
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.audio && (
                          <Badge variant="secondary" className="mt-2">
                            <Headphones className="w-3 h-3 mr-1" />
                            Voice Message
                          </Badge>
                        )}
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-muted to-muted/70 border p-4 rounded-lg mr-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm">🤖 AI is analyzing your question...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Sample Questions */}
          {messages.length <= 1 && mode === 'chat' && (
            <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-3 text-primary">💡 Try asking me about:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  getLocalizedResponse('sample_weather'),
                  getLocalizedResponse('sample_crop'),
                  getLocalizedResponse('sample_disease'),
                  getLocalizedResponse('sample_fertilizer')
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(suggestion)}
                    className="text-left p-2 text-sm bg-white dark:bg-gray-800 rounded border hover:bg-primary/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="border-t pt-4">
            {mode === 'chat' && (
              <div className="flex gap-3">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about crops, weather, diseases, fertilizers, or any farming question..."
                  className="flex-1 min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextQuery();
                    }
                  }}
                />
                <Button 
                  onClick={handleTextQuery} 
                  disabled={!inputText.trim() || isProcessing}
                  className="self-end h-12 px-6"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            )}

            {mode === 'voice' && (
              <div className="text-center space-y-6">
                <div className="flex justify-center gap-4">
                  {!isListening ? (
                    <Button 
                      onClick={startListening} 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
                    >
                      <Mic className="w-6 h-6 mr-3" />
                      Start Voice Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopListening} 
                      size="lg" 
                      variant="destructive"
                      className="px-8 py-6 text-lg"
                    >
                      <MicOff className="w-6 h-6 mr-3" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {isSpeaking && (
                    <Button 
                      onClick={stopSpeaking} 
                      size="lg" 
                      variant="outline"
                      className="px-8 py-6 text-lg"
                    >
                      <VolumeX className="w-6 h-6 mr-3" />
                      Stop Speaking
                    </Button>
                  )}
                </div>
                
                {isListening && (
                  <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-3 text-green-700 dark:text-green-300">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-lg font-medium">🎤 Listening... Please speak clearly</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'image' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-primary/5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={selectedImage} 
                        alt="Selected crop" 
                        className="max-h-64 mx-auto rounded-lg shadow-lg border"
                      />
                      <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                        <Button variant="outline" onClick={clearImage}>
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Camera className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-medium">Upload Crop Image</p>
                        <p className="text-muted-foreground mt-2">
                          Upload a photo of your crops, leaves, or plants for AI analysis
                        </p>
                      </div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                        className="px-8"
                      >
                        <Upload className="w-5 h-5 mr-3" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="What would you like to know about this image? (e.g., diseases, health, growth stage)"
                    className="flex-1 h-12"
                  />
                  <Button 
                    onClick={handleImageQuery} 
                    disabled={!selectedImage || !inputText.trim() || isProcessing}
                    size="lg"
                    className="px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}