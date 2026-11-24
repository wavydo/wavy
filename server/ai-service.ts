import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

interface Establishment {
  id: string;
  businessName: string;
  name?: string;
  category: string;
  discountRate?: number;
  discount?: number;
  city?: string;
  address?: string;
  description?: string;
  rating?: number;
  distance?: string;
}

/**
 * AI Search Assistant powered by Groq
 * Helps users find establishments, deals, and perks using natural language
 */
export async function aiSearchAssistant(
  query: string,
  establishments: Establishment[],
  userContext?: {
    location?: string;
    preferences?: string[];
  }
): Promise<string> {
  try {
    // Format establishments data for AI context
    const establishmentsContext = establishments.map(est => ({
      name: est.businessName || est.name,
      category: est.category,
      discount: est.discountRate || est.discount || 0,
      city: est.city,
      rating: est.rating || 0,
      distance: est.distance,
      description: est.description
    }));

    // Build system prompt
    const systemPrompt = `You are Wavy's intelligent search assistant. Help users discover establishments, deals, and perks in Dominican Republic.

AVAILABLE ESTABLISHMENTS:
${JSON.stringify(establishmentsContext, null, 2)}

USER CONTEXT:
${userContext?.location ? `Location: ${userContext.location}` : ''}
${userContext?.preferences ? `Preferences: ${userContext.preferences.join(', ')}` : ''}

YOUR ROLE:
- Help users find the best places based on their needs
- Recommend establishments with good discounts and ratings
- Provide brief, friendly, and helpful responses in Spanish
- Mention specific establishment names, discounts, and locations
- If no exact match, suggest similar alternatives
- Keep responses under 150 words

RESPONSE FORMAT:
- Start with a friendly greeting
- List 2-3 relevant establishments with their discounts
- Include practical details (location, category)
- End with a helpful suggestion

Always respond in Spanish and be conversational.`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: query
        }
      ],
      model: "openai/gpt-oss-20b", // OpenAI GPT OSS 20B - 1000 tokens/sec - FREE
      temperature: 0.7,
      max_tokens: 400,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu búsqueda. ¿Podrías reformular tu pregunta?";
    
    console.log('✅ AI Search completed:', { query, responseLength: response.length });
    
    return response;
  } catch (error: any) {
    console.error('❌ AI Search error:', error.message);
    
    // Fallback response
    return "Lo siento, estoy teniendo problemas para procesar tu búsqueda en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
}

/**
 * Get AI recommendations based on user preferences
 */
export async function getAIRecommendations(
  establishments: Establishment[],
  userPreferences?: {
    favoriteCategories?: string[];
    budget?: 'low' | 'medium' | 'high';
    location?: string;
  }
): Promise<string> {
  try {
    const query = userPreferences 
      ? `Recomiéndame lugares basado en mis preferencias: ${userPreferences.favoriteCategories?.join(', ')}. Presupuesto: ${userPreferences.budget}. Ubicación: ${userPreferences.location}`
      : "¿Qué lugares me recomiendas hoy?";
    
    return await aiSearchAssistant(query, establishments, {
      location: userPreferences?.location,
      preferences: userPreferences?.favoriteCategories
    });
  } catch (error) {
    console.error('❌ AI Recommendations error:', error);
    return "No pude generar recomendaciones en este momento.";
  }
}

export default {
  aiSearchAssistant,
  getAIRecommendations
};
