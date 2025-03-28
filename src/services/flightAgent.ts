import { BaseAgent, FlightSearchParams, FlightResult } from "../types/agents";
import OpenAI from "openai";

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class FlightAgent implements BaseAgent {
  name = "Flight Search Agent";
  description = "Searches for flight information using OpenAI";

  async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    try {
      console.log("FlightAgent: Starting search with params:", params);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a flight search assistant. Provide realistic flight information based on the user's request.
            Make sure to:
            - Use realistic airline names and flight numbers
            - Consider time zones for arrival times
            - Provide reasonable prices based on the route
            - Include a mix of direct and connecting flights
            - Return 3-5 flights in the array`,
          },
          {
            role: "user",
            content: `Please provide flight options from ${params.from} to ${
              params.to
            } on ${params.date}${
              params.returnDate ? ` with return on ${params.returnDate}` : ""
            } for ${params.passengers || 1} passenger(s).`,
          },
        ],
        functions: [
          {
            name: "returnFlights",
            description: "Returns a list of flight options",
            parameters: {
              type: "object",
              properties: {
                flights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      airline: { type: "string" },
                      flightNumber: { type: "string" },
                      departure: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          airport: { type: "string" },
                        },
                        required: ["time", "airport"],
                      },
                      arrival: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          airport: { type: "string" },
                        },
                        required: ["time", "airport"],
                      },
                      price: { type: "number" },
                      currency: { type: "string" },
                      stops: { type: "number" },
                    },
                    required: [
                      "airline",
                      "flightNumber",
                      "departure",
                      "arrival",
                      "price",
                      "currency",
                      "stops",
                    ],
                  },
                },
              },
              required: ["flights"],
            },
          },
        ],
        function_call: { name: "returnFlights" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log(
        "FlightAgent: Raw API response:",
        completion.choices[0].message
      );
      console.log(
        "FlightAgent: Function call arguments:",
        completion.choices[0].message.function_call?.arguments
      );

      const response = JSON.parse(
        completion.choices[0].message.function_call?.arguments || "{}"
      );
      console.log("FlightAgent: Parsed response:", response);

      const flights = response.flights || [];
      console.log("FlightAgent: Returning flights:", flights);
      return flights;
    } catch (error) {
      console.error("FlightAgent: Error details:", error);
      throw new Error("Failed to search for flights");
    }
  }
}
