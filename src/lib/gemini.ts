import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_API_KEY = 'AIzaSyDIKFIoTjUyjG1kJmPRI6oenhYk4qKjytY';

// Get API key from localStorage or use default
const getAPIKey = () => {
  const userAPIKey = localStorage.getItem('gemini_api_key');
  return userAPIKey || DEFAULT_API_KEY;
};

let genAI = new GoogleGenerativeAI(getAPIKey());

export interface AICropAnalysis {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  treatment: string[];
  prevention: string[];
  affectedArea: number;
}

export interface AIFarmingAdvice {
  query: string;
  response: string;
  language: string;
  category: 'weather' | 'disease' | 'fertilizer' | 'crop' | 'general';
}

class GeminiAIService {
  private getModel() {
    // Refresh genAI instance with current API key
    genAI = new GoogleGenerativeAI(getAPIKey());
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  updateAPIKey(apiKey: string) {
    localStorage.setItem('gemini_api_key', apiKey);
    genAI = new GoogleGenerativeAI(apiKey);
  }

  removeAPIKey() {
    localStorage.removeItem('gemini_api_key');
    genAI = new GoogleGenerativeAI(DEFAULT_API_KEY);
  }

  async analyzeCropImage(imageBase64: string): Promise<AICropAnalysis> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const prompt = `
        Analyze this crop/plant image for diseases and provide a detailed agricultural assessment.
        
        Please provide your response in the following JSON format:
        {
          "disease": "Disease name or 'Healthy Plant'",
          "confidence": number (0-100),
          "severity": "Low" | "Medium" | "High",
          "description": "Detailed description of findings",
          "treatment": ["step1", "step2", "step3"],
          "prevention": ["prevention1", "prevention2", "prevention3"],
          "affectedArea": number (0-100, percentage of plant affected)
        }
        
        Focus on common crop diseases in India like:
        - Late Blight, Early Blight for tomatoes/potatoes
        - Rust diseases for wheat
        - Bacterial leaf blight for rice
        - Powdery mildew for various crops
        
        If the plant appears healthy, indicate so with appropriate confidence level.
      `;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.getModel().generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        disease: 'Analysis Unavailable',
        confidence: 0,
        severity: 'Low' as const,
        description: 'Unable to analyze the image. Please try with a clearer photo.',
        treatment: ['Consult local agricultural expert'],
        prevention: ['Regular crop monitoring'],
        affectedArea: 0
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze crop image');
    }
  }

  async getFarmingAdvice(query: string, language: string = 'english'): Promise<AIFarmingAdvice> {
    try {
      const languageInstructions = {
        hindi: 'Respond in Hindi (Devanagari script)',
        marathi: 'Respond in Marathi (Devanagari script)', 
        malayalam: 'Respond in Malayalam (Malayalam script)',
        punjabi: 'Respond in Punjabi (Gurmukhi script)',
        english: 'Respond in English'
      };

      const prompt = `
        You are an expert agricultural advisor helping Indian farmers. 
        The farmer asks: "${query}"
        
        ${languageInstructions[language as keyof typeof languageInstructions] || 'Respond in English'}
        
        Provide practical, actionable advice specific to Indian farming conditions.
        Consider factors like:
        - Local climate and seasons
        - Common Indian crops (wheat, rice, sugarcane, cotton, etc.)
        - Traditional and modern farming practices
        - Cost-effective solutions for small farmers
        - Government schemes and subsidies when relevant
        
        Keep the response concise but informative (2-4 sentences).
        Focus on immediate actionable steps.
      `;

      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Determine category based on query keywords
      const queryLower = query.toLowerCase();
      let category: AIFarmingAdvice['category'] = 'general';
      
      if (queryLower.includes('weather') || queryLower.includes('rain') || queryLower.includes('मौसम')) {
        category = 'weather';
      } else if (queryLower.includes('disease') || queryLower.includes('pest') || queryLower.includes('बीमारी')) {
        category = 'disease';
      } else if (queryLower.includes('fertilizer') || queryLower.includes('खाद') || queryLower.includes('उर्वरक')) {
        category = 'fertilizer';
      } else if (queryLower.includes('crop') || queryLower.includes('फसल') || queryLower.includes('yield')) {
        category = 'crop';
      }

      return {
        query,
        response: text.trim(),
        language,
        category
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback responses in different languages
      const fallbackResponses = {
        hindi: 'क्षमा करें, मैं अभी आपकी मदद नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।',
        marathi: 'माफ करा, मी सध्या तुमची मदत करू शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
        malayalam: 'ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ നിങ്ങളെ സഹായിക്കാൻ കഴിയില്ല. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
        english: 'Sorry, I cannot help you right now. Please try again later.'
      };

      return {
        query,
        response: fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.english,
        language,
        category: 'general'
      };
    }
  }

  async getWeatherAdvice(location: string = 'India'): Promise<string> {
    try {
      const prompt = `
        Provide current agricultural weather advice for farmers in ${location}.
        Include:
        - General weather conditions
        - Impact on current season crops
        - Recommended farming activities
        - Precautions to take
        
        Keep it practical and actionable for Indian farmers.
      `;

      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Weather advice error:', error);
      return 'Unable to fetch weather advice at the moment. Please check local weather conditions and plan accordingly.';
    }
  }

  async getCropRecommendations(season: string, soilType: string = '', region: string = 'India'): Promise<string[]> {
    try {
      const prompt = `
        Recommend the best crops to plant in ${season} season in ${region}.
        ${soilType ? `Soil type: ${soilType}` : ''}
        
        Provide a list of 5-7 recommended crops with brief reasons.
        Format as a simple list, one crop per line.
        Focus on crops suitable for Indian farmers.
      `;

      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return text.split('\n').filter(line => line.trim()).slice(0, 7);
    } catch (error) {
      console.error('Crop recommendations error:', error);
      return ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize'];
    }
  }
}

export const geminiAI = new GeminiAIService();

// Direct API access for general AI insights
export const getAIInsights = async (prompt: string): Promise<string[]> => {
  try {
    const model = new GoogleGenerativeAI(getAPIKey()).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split response into individual insights/recommendations
    const insights = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\*\s*|\d+\.\s*/, '').trim())
      .filter(line => line.length > 10); // Filter out very short lines
    
    return insights.slice(0, 6); // Return up to 6 insights
  } catch (error) {
    console.error('Error getting AI insights:', error);
    throw new Error('Failed to generate AI insights');
  }
};