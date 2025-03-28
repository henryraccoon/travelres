import {
  BaseAgent,
  UserQuery,
  OrchestrationPlan,
  ComprehensiveResponse,
  FlightResult,
  AttractionResult,
} from "../types/agents";
import { FlightAgent } from "./flightAgent";
import { TripAdvisorAgent } from "./tripAdvisorAgent";
import { getTravelInfo } from "./travelService";
import { TravelResponse } from "../types/travel";

export class OrchestratorAgent implements BaseAgent {
  name = "Travel Assistant Orchestrator";
  description =
    "Coordinates different travel-related agents to provide comprehensive travel information";

  private flightAgent: FlightAgent;
  private tripAdvisorAgent: TripAdvisorAgent;

  constructor() {
    this.flightAgent = new FlightAgent();
    this.tripAdvisorAgent = new TripAdvisorAgent();
  }

  private createPlan(query: UserQuery): OrchestrationPlan {
    console.log("OrchestratorAgent: Creating plan for query:", query);

    // Check if dates are provided
    const hasDates = Boolean(query.dates?.start && query.location);
    console.log("OrchestratorAgent: Has dates:", hasDates);

    // Simple keyword-based planning
    const needsFlights =
      hasDates || // Include flights if dates are provided
      query.text.toLowerCase().includes("flight") ||
      query.text.toLowerCase().includes("travel to") ||
      query.text.toLowerCase().includes("get to") ||
      query.text.toLowerCase().includes("fly to") ||
      query.text.toLowerCase().includes("airline") ||
      query.text.toLowerCase().includes("airport");

    const needsAttractions =
      query.text.toLowerCase().includes("attraction") ||
      query.text.toLowerCase().includes("see") ||
      query.text.toLowerCase().includes("visit") ||
      query.text.toLowerCase().includes("place") ||
      query.text.toLowerCase().includes("destination");

    console.log("OrchestratorAgent: Plan needs flights:", needsFlights);
    console.log("OrchestratorAgent: Plan needs attractions:", needsAttractions);

    return {
      needsFlights,
      needsAttractions,
      needsGeneralInfo: true, // Always get general info
      flightParams: needsFlights
        ? {
            from: query.from || "user location", // Use provided starting point or default to user location
            to: query.location || "",
            date: query.dates?.start || "next month",
            returnDate: query.dates?.end,
            passengers: 1,
          }
        : undefined,
      attractionParams: needsAttractions
        ? {
            location: query.location || "",
            limit: 5,
          }
        : undefined,
      researchParams: {
        destination: query.location || "",
        query: query.text,
        type: needsAttractions ? "attractions" : "general",
      },
    };
  }

  async coordinateRequest(query: UserQuery): Promise<ComprehensiveResponse> {
    try {
      const plan = this.createPlan(query);
      console.log("OrchestratorAgent: Created plan:", plan);

      const results = await Promise.allSettled([
        plan.needsFlights
          ? this.flightAgent.searchFlights(plan.flightParams!)
          : Promise.resolve([]),
        plan.needsAttractions
          ? this.tripAdvisorAgent.searchAttractions(plan.attractionParams!)
          : Promise.resolve([]),
        getTravelInfo(plan.researchParams!),
      ]);

      console.log("OrchestratorAgent: All results:", results);

      const successfulResults = results.filter((r) => r.status === "fulfilled");
      const failedResults = results.filter((r) => r.status === "rejected");

      return {
        flights:
          successfulResults[0]?.status === "fulfilled" && plan.needsFlights
            ? (successfulResults[0].value as FlightResult[])
            : undefined,
        attractions:
          successfulResults[1]?.status === "fulfilled" && plan.needsAttractions
            ? (successfulResults[1].value as AttractionResult[])
            : undefined,
        generalInfo:
          successfulResults[2]?.status === "fulfilled"
            ? (successfulResults[2].value as TravelResponse)
            : undefined,
        errors: failedResults.map(
          (r) => (r as PromiseRejectedResult).reason.message
        ),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Orchestration error:", error);
      throw new Error("Failed to coordinate travel information");
    }
  }
}
