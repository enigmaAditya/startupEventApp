/* ============================================
   StartupEvents — AI Service (OpenAI Integration)
   Syllabus: BE Unit VI — OpenAI API, prompt engineering,
             embeddings, third-party API integration
   ============================================ */

/**
 * NOTE: Requires 'openai' npm package and OPENAI_API_KEY in .env
 * Install: npm install openai
 *
 * If you don't have an API key, this module exports mock functions
 * that return realistic dummy data for development.
 */

const config = require('../config');

// Conditionally load OpenAI (graceful fallback if not installed)
let OpenAI;
try {
  OpenAI = require('openai');
} catch {
  OpenAI = null;
}

// ---- Initialize client ----
const openai = OpenAI && config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey })
  : null;

const isAIAvailable = () => openai !== null;

/**
 * Get personalized event recommendations based on user interests
 * 
 * Demonstrates: prompt engineering — structured prompt with clear
 *               instructions, context injection, and JSON output format
 *
 * @param {string[]} userInterests - Array of user interest tags
 * @param {Object[]} availableEvents - List of events to recommend from
 * @returns {Promise<Array>} Recommendations with scores and reasons
 */
const getRecommendations = async (userInterests, availableEvents) => {
  if (!isAIAvailable()) {
    return getMockRecommendations(userInterests, availableEvents);
  }

  const eventSummaries = availableEvents.map((e, i) => ({
    index: i,
    title: e.title,
    category: e.category,
    tags: e.tags,
    description: e.description?.slice(0, 100),
  }));

  // Structured prompt with clear instructions
  const prompt = `You are an event recommendation engine for a startup community platform.

Given a user interested in: ${userInterests.join(', ')}

Recommend the most relevant events from this list and explain why each is a good match.
Rate relevance from 0 to 1.

Events:
${JSON.stringify(eventSummaries, null, 2)}

IMPORTANT: Respond ONLY with a valid JSON array in this exact format:
[
  {
    "eventIndex": 0,
    "relevanceScore": 0.95,
    "reason": "Brief explanation of why this event matches the user's interests"
  }
]

Sort by relevanceScore descending. Include only events with score >= 0.3.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds only with valid JSON arrays.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const recommendations = JSON.parse(content);

    // Map back to full event data
    return recommendations.map((rec) => ({
      event: availableEvents[rec.eventIndex],
      relevanceScore: rec.relevanceScore,
      reason: rec.reason,
    }));
  } catch (error) {
    console.error('AI recommendation error:', error.message);
    return getMockRecommendations(userInterests, availableEvents);
  }
};

/**
 * Generate or enhance an event description using AI
 * 
 * Demonstrates: prompt engineering with role + context + constraints
 *
 * @param {Object} eventData - Basic event information
 * @returns {Promise<string>} Enhanced description
 */
const enhanceDescription = async (eventData) => {
  if (!isAIAvailable()) {
    return eventData.description || 'An exciting startup event you won\'t want to miss!';
  }

  const prompt = `Write a compelling, professional event description for a startup community platform.

Event details:
- Title: ${eventData.title}
- Category: ${eventData.category}
- Date: ${eventData.date}
- Location: ${eventData.location?.city || 'Online'}
- Tags: ${eventData.tags?.join(', ') || 'General'}
${eventData.description ? `- Draft description: ${eventData.description}` : ''}

Requirements:
- Keep it under 200 words
- Use engaging, professional tone
- Highlight what attendees will gain
- Include a call-to-action

Respond with ONLY the description text, no quotes or markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content?.trim() || eventData.description;
  } catch (error) {
    console.error('AI description enhancement error:', error.message);
    return eventData.description || '';
  }
};

/**
 * Semantic search using embeddings
 * 
 * Demonstrates: OpenAI embeddings API, cosine similarity,
 *               vector-based search
 *
 * @param {string} query - User search query
 * @param {Object[]} events - Events to search through
 * @returns {Promise<Object[]>} Events ranked by semantic similarity
 */
const semanticSearch = async (query, events) => {
  if (!isAIAvailable()) {
    // Fallback to simple text search
    const q = query.toLowerCase();
    return events
      .filter((e) => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
      .map((e) => ({ event: e, similarity: 0.5 }));
  }

  try {
    // Get embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryVector = queryEmbedding.data[0].embedding;

    // Get embeddings for all events
    const eventTexts = events.map(
      (e) => `${e.title} ${e.category} ${e.tags?.join(' ') || ''} ${e.description?.slice(0, 200) || ''}`,
    );

    const eventEmbeddings = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: eventTexts,
    });

    // Calculate cosine similarity
    const results = events.map((event, i) => {
      const eventVector = eventEmbeddings.data[i].embedding;
      const similarity = cosineSimilarity(queryVector, eventVector);
      return { event, similarity };
    });

    // Sort by similarity descending
    return results.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Semantic search error:', error.message);
    return events.map((e) => ({ event: e, similarity: 0 }));
  }
};

// ---- Helpers ----

/**
 * Cosine similarity between two vectors
 * Demonstrates: vector math, reduce, Math.sqrt
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Similarity score (0-1)
 */
const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Mock recommendations for development (no API key needed)
 */
const getMockRecommendations = (interests, events) => {
  return events
    .map((event) => {
      const matchingTags = event.tags?.filter((t) =>
        interests.some((i) => t.toLowerCase().includes(i.toLowerCase())),
      ) || [];

      const score = Math.min(1, matchingTags.length * 0.3 + 0.2);

      return {
        event,
        relevanceScore: parseFloat(score.toFixed(2)),
        reason: matchingTags.length > 0
          ? `Matches your interests in ${matchingTags.join(', ')}`
          : `Popular ${event.category} event in the community`,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Generate a full event draft from a simple prompt
 * 
 * Demonstrates: Advanced structured output generation, 
 *               multi-field schema mapping, persona-based prompting.
 * 
 * @param {string} userPrompt - A short idea of the event (e.g., "Web3 hackathon in Delhi")
 * @returns {Promise<Object>} Structured event draft
 */
const generateEventDraft = async (userPrompt) => {
  if (!isAIAvailable()) {
    // Mock fallback
    return {
      title: `Grand ${userPrompt.split(' ').slice(0, 3).join(' ')} Convention`,
      description: `Join us for an incredible journey into the heart of ${userPrompt}. We'll gather top experts, founders, and enthusiasts for a day of deep-dives, networking, and innovation. Don't miss this chance to shape the future of the startup ecosystem!`,
      category: 'conference',
      tags: ['Networking', 'Innovation', 'Startup'],
      suggestedCity: 'Mumbai'
    };
  }

  const prompt = `You are a professional event architect for a startup community platform called StartupEvents.
  Your goal is to take a simple event idea and expand it into a full, high-converting event listing.

  INPUT IDEA: "${userPrompt}"

  REQUIRMENTS:
  1. Generate a catchy, professional Title.
  2. Write a 3-paragraph compelling Description (benefits-focused).
  3. Choose the best Category from: hackathon, pitch-night, workshop, meetup, conference.
  4. Suggest 3-5 relevant startup tags (e.g., AI/ML, SaaS, Web3).
  5. Identify the most likely City for this event.

  OUTPUT FORMAT: You must respond ONLY with a valid JSON object:
  {
    "title": "...",
    "description": "...",
    "category": "...",
    "tags": ["...", "..."],
    "suggestedCity": "..."
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional copywriter who only speaks in JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('AI event generation error:', error.message);
    return { title: 'AI Generation Failed', description: 'Please try describing your event again.' };
  }
};

module.exports = {
  isAIAvailable,
  getRecommendations,
  enhanceDescription,
  semanticSearch,
  generateEventDraft,
};
