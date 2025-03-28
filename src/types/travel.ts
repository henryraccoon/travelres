export interface TravelQuery {
  destination?: string;
  query: string;
  type: "attractions" | "hotels" | "restaurants" | "general";
}

export interface TravelResponse {
  content: string;
  sources: string[];
  error?: string;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}
