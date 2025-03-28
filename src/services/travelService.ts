import OpenAI from "openai";
import { TravelQuery, TravelResponse } from "../types/travel";

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getTravelInfo(
  query: TravelQuery
): Promise<TravelResponse> {
  try {
    // Use OpenAI to search and analyze travel information
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable travel assistant. Provide detailed, accurate, and helpful travel information.
          Format your responses in markdown with the following structure:
          1. Start with a brief introduction about the destination
          2. List top attractions with ** at the end of each name
          3. Include descriptions for each attraction
          4. Add relevant links to official websites or TripAdvisor
          5. Include practical information like best times to visit, tips, etc.
          
          Make sure to:
          - Use proper markdown formatting
          - Include specific details and facts
          - Provide practical advice
          - Include sources where possible
          - Make the information engaging and easy to read`,
        },
        {
          role: "user",
          content: `Please provide detailed travel information about ${
            query.destination || "the destination"
          } focusing on ${query.type}.
          Query: ${query.query}
          
          Please include:
          1. A comprehensive overview
          2. Top attractions with descriptions
          3. Practical tips and advice
          4. Best times to visit
          5. Any relevant cultural information`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      content:
        completion.choices[0].message.content || "No information available.",
      sources: [], // We'll get sources from the content itself
    };
  } catch (error) {
    console.error("Travel info error:", error);
    return {
      content: "Sorry, there was an error processing your request.",
      sources: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
