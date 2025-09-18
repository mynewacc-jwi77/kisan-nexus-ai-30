import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Umbrella,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Leaf
} from "lucide-react";
import weatherDashboard from "@/assets/weather-dashboard.jpg";

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: any;
    pressure: number;
    visibility: number;
    uvIndex: number;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: any;
    precipitation: number;
    humidity: number;
  }[];
  alerts: {
    type: 'warning' | 'info' | 'success';
    message: string;
    icon: any;
  }[];
  farmingRecommendations: string[];
}

export default function Weather() {
  const [location, setLocation] = useState("Pune, Maharashtra");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    // Mock weather data
    const mockWeatherData: WeatherData = {
      current: {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: "Partly Cloudy",
        icon: Cloud,
        pressure: 1013,
        visibility: 10,
        uvIndex: 6
      },
      forecast: [
        { date: "Today", high: 32, low: 22, condition: "Sunny", icon: Sun, precipitation: 0, humidity: 60 },
        { date: "Tomorrow", high: 30, low: 24, condition: "Partly Cloudy", icon: Cloud, precipitation: 10, humidity: 70 },
        { date: "Wed", high: 28, low: 23, condition: "Light Rain", icon: CloudRain, precipitation: 80, humidity: 85 },
        { date: "Thu", high: 29, low: 22, condition: "Cloudy", icon: Cloud, precipitation: 30, humidity: 75 },
        { date: "Fri", high: 31, low: 24, condition: "Sunny", icon: Sun, precipitation: 5, humidity: 65 },
        { date: "Sat", high: 33, low: 25, condition: "Hot", icon: Sun, precipitation: 0, humidity: 55 },
        { date: "Sun", high: 27, low: 21, condition: "Rain", icon: CloudRain, precipitation: 90, humidity: 90 }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Heavy rainfall expected on Sunday. Plan indoor activities.',
          icon: CloudRain
        },
        {
          type: 'info', 
          message: 'Good weather for spraying pesticides today and tomorrow.',
          icon: Leaf
        },
        {
          type: 'success',
          message: 'Ideal conditions for harvesting this week.',
          icon: Sun
        }
      ],
      farmingRecommendations: [
        "Apply fungicide before expected rainfall on Wednesday",
        "Harvest mature crops before Sunday's heavy rain",
        "Increase irrigation frequency during hot weather (Sat)",
        "Good conditions for transplanting seedlings today",
        "Monitor crops for waterlogging after Sunday's rain"
      ]
    };

    setWeatherData(mockWeatherData);
  }, [location]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-warning/10 border-warning text-warning-foreground';
      case 'info': return 'bg-blue-500/10 border-blue-500 text-blue-700';
      case 'success': return 'bg-success/10 border-success text-success-foreground';
      default: return 'bg-muted';
    }
  };

  if (!weatherData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const selectedForecast = weatherData.forecast[selectedDay];
  const CurrentIcon = weatherData.current.icon;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <Cloud className="w-3 h-3 mr-1" />
            Agricultural Weather
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Weather Dashboard
            <span className="block text-primary">For Smart Farming</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get detailed weather insights and agricultural recommendations 
            to make informed farming decisions.
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center space-x-2 py-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">SISTech,Bhopal</span>
              <Button variant="ghost" size="sm" className="ml-2">
                Change Location
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Weather */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-48">
            <img 
              src={weatherDashboard} 
              alt="Weather dashboard" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CurrentIcon className="w-12 h-12" />
                      <div>
                        <div className="text-5xl font-bold">{weatherData.current.temperature}°C</div>
                        <div className="text-white/90">{weatherData.current.condition}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Droplets className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Humidity</div>
                      <div className="font-semibold">{weatherData.current.humidity}%</div>
                    </div>
                    <div>
                      <Wind className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Wind</div>
                      <div className="font-semibold">{weatherData.current.windSpeed} km/h</div>
                    </div>
                    <div>
                      <Eye className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Visibility</div>
                      <div className="font-semibold">{weatherData.current.visibility} km</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 7-Day Forecast */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  7-Day Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weatherData.forecast.map((day, index) => {
                    const DayIcon = day.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedDay === index 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">{day.date}</div>
                        <DayIcon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">
                          <div className="font-semibold">{day.high}°</div>
                          <div className="text-muted-foreground">{day.low}°</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Details */}
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <selectedForecast.icon className="w-12 h-12 mx-auto mb-2 text-primary" />
                        <div className="font-semibold text-lg">{selectedForecast.condition}</div>
                        <div className="text-sm text-muted-foreground">{selectedForecast.date}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>High Temperature</span>
                          <span className="font-semibold">{selectedForecast.high}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Temperature</span>
                          <span className="font-semibold">{selectedForecast.low}°C</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Precipitation</span>
                          <span className="font-semibold">{selectedForecast.precipitation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Humidity</span>
                          <span className="font-semibold">{selectedForecast.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recommendations">Farm Recommendations</TabsTrigger>
                    <TabsTrigger value="analysis">Weather Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recommendations" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">This Week's Recommendations</h3>
                    <ul className="space-y-3">
                      {weatherData.farmingRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Badge variant="outline" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Weekly Weather Trends</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="text-sm">Average Temperature</span>
                        </div>
                        <div className="text-2xl font-bold">29°C</div>
                        <div className="text-sm text-muted-foreground">+2°C from last week</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm">Total Rainfall</span>
                        </div>
                        <div className="text-2xl font-bold">25mm</div>
                        <div className="text-sm text-muted-foreground">Expected this week</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Additional Info */}
          <div className="space-y-6">
            {/* Weather Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weatherData.alerts.map((alert, index) => {
                  const AlertIcon = alert.icon;
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertIcon className="w-4 h-4 mt-0.5" />
                        <span className="text-sm">{alert.message}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{weatherData.current.pressure}</div>
                    <div className="text-xs text-muted-foreground">Pressure (hPa)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{weatherData.current.uvIndex}</div>
                    <div className="text-xs text-muted-foreground">UV Index</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Sunrise</span>
                    <span className="text-sm font-medium">6:24 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sunset</span>
                    <span className="text-sm font-medium">6:45 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Moon Phase</span>
                    <span className="text-sm font-medium">Waxing Crescent</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farming Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2" />
                  Farming Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="font-medium text-sm text-success">Best Days for Sowing</div>
                    <div className="text-xs text-muted-foreground">Today, Tomorrow</div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <div className="font-medium text-sm text-warning">Avoid Spraying</div>
                    <div className="text-xs text-muted-foreground">Wednesday (Rain expected)</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="font-medium text-sm text-blue-700">Irrigation Needed</div>
                    <div className="text-xs text-muted-foreground">Friday, Saturday</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}