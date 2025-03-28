import {
  BaseAgent,
  AttractionSearchParams,
  AttractionResult,
} from "../types/agents";
import OpenAI from "openai";

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class TripAdvisorAgent implements BaseAgent {
  name = "TripAdvisor Search Agent";
  description = "Searches for attractions and reviews using OpenAI";

  private getAttractionImage(name: string): string {
    // Use picsum.photos to get a random travel-themed image
    // The seed ensures the same attraction always gets the same image
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/800/600`;
  }

  async searchAttractions(
    params: AttractionSearchParams
  ): Promise<AttractionResult[]> {
    try {
      console.log("TripAdvisorAgent: Starting search with params:", params);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a travel attractions expert. Provide detailed information about attractions based on the user's request.
            Make sure to:
            - Provide accurate and detailed descriptions
            - Use realistic ratings and review counts
            - Include a mix of free and paid attractions
            - Cover different types of attractions (museums, parks, landmarks, etc.)
            - Return 5-7 attractions in the array
            - Do not include imageUrl in the response, it will be added later`,
          },
          {
            role: "user",
            content: `Please provide information about top attractions in ${
              params.location
            }${
              params.category ? ` focusing on ${params.category}` : ""
            }. Limit to ${params.limit || 5} attractions.`,
          },
        ],
        functions: [
          {
            name: "returnAttractions",
            description: "Returns a list of attractions",
            parameters: {
              type: "object",
              properties: {
                attractions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      rating: { type: "number" },
                      reviewCount: { type: "number" },
                      priceLevel: { type: "string" },
                      description: { type: "string" },
                      url: { type: "string" },
                      categories: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: [
                      "name",
                      "rating",
                      "reviewCount",
                      "priceLevel",
                      "description",
                      "url",
                      "categories",
                    ],
                  },
                },
              },
              required: ["attractions"],
            },
          },
        ],
        function_call: { name: "returnAttractions" },
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = JSON.parse(
        completion.choices[0].message.function_call?.arguments || "{}"
      );
      console.log("TripAdvisorAgent: Parsed response:", response);

      // Add placeholder images for each attraction
      const attractionsWithImages = (response.attractions || []).map(
        (attraction: AttractionResult) => ({
          ...attraction,
          imageUrl: this.getAttractionImage(attraction.name),
        })
      );

      console.log(
        "TripAdvisorAgent: Returning attractions:",
        attractionsWithImages
      );
      return attractionsWithImages;
    } catch (error) {
      console.error("TripAdvisorAgent: Error details:", error);
      throw new Error("Failed to search for attractions");
    }
  }
}
