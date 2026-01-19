import { GoogleGenAI, Type } from "@google/genai";
import { FactCheckResult, FactCheckStatus, Source } from '../types';

interface GeminiFactCheckResponse {
  status: FactCheckStatus;
  explanation: string;
  sources: Source[];
}

/**
 * Performs a fact check on the given input using the Gemini API with Google Search grounding.
 * @param input The news headline, article link, or message to fact check.
 * @returns A promise that resolves to a FactCheckResult object.
 */
export const factCheckNews = async (input: string): Promise<FactCheckResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined. Please ensure it's set in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // System instruction for the Gemini model to act as a fact checker.
  const systemInstruction = `You are a highly accurate Real-Time Fact Checker. Your goal is to critically evaluate news headlines, article links, or messages provided by the user. You must use Google Search to find relevant, up-to-date information from reputable sources.`;

  // Detailed prompt for the Gemini model to guide its fact-checking process and output format.
  const prompt = `
    Based on the following input: "${input}", perform a comprehensive fact check.

    1.  Determine the credibility and classify it as one of the following:
        -   **REAL**: Verified by multiple reputable sources.
        -   **FAKE**: Clearly debunked, satirical, or a known hoax/scam.
        -   **UNVERIFIED**: Insufficient evidence from reputable sources to confirm or deny.

    2.  Provide a concise, clear explanation for your determination. If it's fake or a scam, explain precisely why (e.g., clickbait, satirical site, debunked by fact-checkers, misleading information).

    3.  Identify and list at least 2 reputable news sources (e.g., Reuters, BBC, AP, official government sites, well-established academic institutions). For each source, provide its title and the direct URL. Prioritize sources that directly address the veracity of the input.

    4. Return the response strictly as a JSON object conforming to the provided schema. Do not include any additional text or formatting outside the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Model selected for general text tasks with grounding capability.
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable Google Search for real-time information.
        responseMimeType: "application/json", // Request JSON output.
        responseSchema: { // Define the schema for the expected JSON response.
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              enum: [FactCheckStatus.REAL, FactCheckStatus.FAKE, FactCheckStatus.UNVERIFIED],
              description: 'The fact-check status of the input: REAL, FAKE, or UNVERIFIED.',
            },
            explanation: {
              type: Type.STRING,
              description: 'A detailed explanation for the fact-check determination.',
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Title of the reputable source.' },
                  url: { type: Type.STRING, description: 'URL of the reputable source.' },
                },
                required: ['title', 'url'],
              },
              description: 'An array of at least two reputable source objects, each with a title and URL.',
            },
          },
          required: ['status', 'explanation', 'sources'],
          propertyOrdering: ['status', 'explanation', 'sources'],
        },
      },
    });

    const jsonStr = response.text?.trim();

    if (!jsonStr) {
      throw new Error("No response text received from the model.");
    }

    let parsedResponse: GeminiFactCheckResponse;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonStr, parseError);
      throw new Error("Failed to parse the model's response. It did not return valid JSON.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const allSources: Source[] = [...(parsedResponse.sources || [])];

    // Extract additional sources from Google Search grounding chunks if available.
    if (groundingChunks && Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          // Add grounding search results as additional sources, if not already present.
          // Note: The prompt asks Gemini to provide 2 reputable sources. Grounding chunks
          // provide the *raw* search results Gemini used. We combine them.
          if (!allSources.some(s => s.url === chunk.web?.uri)) {
            allSources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }
    }

    return {
      status: parsedResponse.status,
      explanation: parsedResponse.explanation,
      sources: allSources,
    };

  } catch (error) {
    console.error("Error during fact-checking:", error);
    return {
      status: FactCheckStatus.ERROR,
      explanation: `An error occurred: ${(error as Error).message || 'Unknown error.'}. Please try again.`,
      sources: [],
    };
  }
};