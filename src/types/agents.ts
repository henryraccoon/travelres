import { TravelQuery, TravelResponse } from "./travel";

// Base types for all agents
export interface BaseAgent {
  name: string;
  description: string;
}

// Flight related types
export interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers?: number;
}

export interface FlightResult {
  airline: string;
  flightNumber: string;
  departure: {
    time: string;
    airport: string;
  };
  arrival: {
    time: string;
    airport: string;
  };
  price: number;
  currency: string;
  stops: number;
}

// TripAdvisor related types
export interface AttractionSearchParams {
  location: string;
  category?: string;
  limit?: number;
}

export interface AttractionResult {
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  description: string;
  url: string;
  imageUrl?: string;
  categories: string[];
}

// Orchestrator types
export interface OrchestrationPlan {
  needsFlights: boolean;
  needsAttractions: boolean;
  needsGeneralInfo: boolean;
  flightParams?: FlightSearchParams;
  attractionParams?: AttractionSearchParams;
  researchParams?: TravelQuery;
}

export interface ComprehensiveResponse {
  flights?: FlightResult[];
  attractions?: AttractionResult[];
  generalInfo?: TravelResponse;
  errors?: string[];
  timestamp: Date;
}

// User query types
export interface UserQuery {
  text: string;
  location?: string;
  from?: string;
  dates?: {
    start: string;
    end?: string;
  };
  preferences?: {
    maxPrice?: number;
    interests?: string[];
  };
}
