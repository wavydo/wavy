import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { establishments } from '../shared/schema.js';
import { sql } from 'drizzle-orm';
import { aiSearchAssistant, getAIRecommendations } from './ai-service.js';

const router = Router();

// ============================================
// POST - AI Search Assistant
// ============================================
router.post('/ai/search', async (req: Request, res: Response) => {
  try {
    const { query, userContext } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a string'
      });
    }

    console.log('🤖 AI Search request:', { query, hasContext: !!userContext });

    // Fetch all active establishments
    const allEstablishments = await db
      .select()
      .from(establishments)
      .where(sql`is_active = true AND approved = true`)
      .limit(50); // Limit to avoid token overflow

    // Call AI service
    const response = await aiSearchAssistant(
      query,
      allEstablishments as any[],
      userContext
    );

    // Check if response is an action (JSON format)
    let actionData = null;
    let message = response;
    
    try {
      // Try to parse as JSON to detect actions
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.type === 'action') {
          actionData = parsed;
          message = parsed.message;
        }
      }
    } catch (e) {
      // Not JSON, treat as normal text
    }

    res.json({
      success: true,
      response: message,
      action: actionData ? {
        type: actionData.action,
        data: actionData.data
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ AI Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI search',
      message: error.message
    });
  }
});

// ============================================
// POST - Get AI Recommendations
// ============================================
router.post('/ai/recommendations', async (req: Request, res: Response) => {
  try {
    const { userPreferences } = req.body;

    console.log('🤖 AI Recommendations request:', { userPreferences });

    // Fetch all active establishments
    const allEstablishments = await db
      .select()
      .from(establishments)
      .where(sql`is_active = true AND approved = true`)
      .limit(50);

    // Call AI service
    const response = await getAIRecommendations(
      allEstablishments as any[],
      userPreferences
    );

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ AI Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI recommendations',
      message: error.message
    });
  }
});

// ============================================
// GET - AI Health Check
// ============================================
router.get('/ai/health', async (req: Request, res: Response) => {
  try {
    const hasApiKey = !!process.env.GROQ_API_KEY;
    
    res.json({
      success: true,
      status: hasApiKey ? 'ready' : 'not_configured',
      provider: 'Groq (Llama 3.1 70B)',
      message: hasApiKey 
        ? 'AI service is ready' 
        : 'GROQ_API_KEY not configured'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
