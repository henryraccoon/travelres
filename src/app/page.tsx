"use client";

import { useState } from "react";
import { UserQuery, ComprehensiveResponse } from "@/types/agents";
import { OrchestratorAgent } from "@/services/orchestratorAgent";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [dates, setDates] = useState<{ start: string; end?: string }>({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComprehensiveResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orchestrator = new OrchestratorAgent();
      const userQuery: UserQuery = {
        text: query,
        location,
        from,
        dates,
        preferences: {
          interests: [],
        },
      };
      const response = await orchestrator.coordinateRequest(userQuery);
      setResult(response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatGeneralInfo = (content: string) => {
    // Add an empty line after "Top Attractions"
    const contentWithSpace = content.replace(
      "Top Attractions",
      "Top Attractions\n"
    );

    // Split content into paragraphs
    const paragraphs = contentWithSpace.split("\n\n");

    return paragraphs
      .map((paragraph, index) => {
        // Check if paragraph starts with ## (section header)
        if (paragraph.trim().startsWith("##")) {
          return (
            <h2
              key={index}
              className="text-2xl font-bold text-gray-900 mt-8 mb-4"
            >
              {paragraph.replace("##", "").trim()}
            </h2>
          );
        } else {
          // Regular paragraph
          const text = paragraph.trim();
          // Split the text into lines to handle place names at the end of each line
          const lines = text.split("\n");

          return (
            <div key={index} className="text-gray-800 leading-relaxed mb-4">
              {lines.map((line, lineIndex) => {
                // Check if the line ends with **
                if (line.trim().endsWith("**")) {
                  // Find the last occurrence of **
                  const lastIndex = line.lastIndexOf("**");
                  const placeName = line.substring(0, lastIndex).trim();
                  const description = line.substring(lastIndex + 2).trim();
                  return (
                    <div key={lineIndex} className="mb-4">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {placeName}
                      </span>
                      {description && (
                        <p className="mt-2 text-gray-700">{description}</p>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={lineIndex} className="text-gray-700">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        }
      })
      .filter(Boolean);
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Travel Research Assistant
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-8 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label
            htmlFor="from"
            className="block text-sm font-medium mb-1 text-gray-900"
          >
            From
          </label>
          <input
            type="text"
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-2 border rounded-md bg-white text-gray-900"
            placeholder="e.g., New York"
            required
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium mb-1 text-gray-900"
          >
            Destination
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-md bg-white text-gray-900"
            placeholder="e.g., Paris, France"
            required
          />
        </div>

        <div>
          <label
            htmlFor="query"
            className="block text-sm font-medium mb-1 text-gray-900"
          >
            What would you like to know?
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded-md bg-white text-gray-900"
            placeholder="e.g., best restaurants and flights from New York"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-1 text-gray-900"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
              className="w-full p-2 border rounded-md bg-white text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium mb-1 text-gray-900"
            >
              End Date (Optional)
            </label>
            <input
              type="date"
              id="endDate"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
              className="w-full p-2 border rounded-md bg-white text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-8">
          {/* Flights Section */}
          {result.flights && result.flights.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
                Flight Options
              </h2>
              <div className="space-y-4">
                {result.flights.map((flight, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {flight.airline}
                          </h3>
                          <span className="text-sm text-gray-600">
                            Flight {flight.flightNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">
                              {flight.departure.time}
                            </span>
                            <span className="text-gray-600">
                              ({flight.departure.airport})
                            </span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">
                              {flight.arrival.time}
                            </span>
                            <span className="text-gray-600">
                              ({flight.arrival.airport})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {flight.price} {flight.currency}
                        </p>
                        <p className="text-sm text-gray-600">
                          {flight.stops} stop{flight.stops !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attractions Section */}
          {result.attractions && result.attractions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
                Top Attractions in {location}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.attractions.map((attraction, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {attraction.imageUrl && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={attraction.imageUrl}
                          alt={attraction.name}
                          className="object-cover w-full h-48"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">
                        {attraction.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span>{attraction.rating}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {attraction.reviewCount.toLocaleString()} reviews
                        </span>
                        <span>•</span>
                        <span>{attraction.priceLevel}</span>
                      </div>
                      <p className="text-gray-800 mb-3 line-clamp-2">
                        {attraction.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {attraction.categories.map((category, catIndex) => (
                          <span
                            key={catIndex}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <a
                        href={attraction.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                      >
                        View on TripAdvisor
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Information Section */}
          {result.generalInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
                Travel Guide for {location}
              </h2>
              <div className="prose max-w-none">
                {formatGeneralInfo(result.generalInfo.content)}
              </div>
              {result.generalInfo.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    Sources
                  </h3>
                  <ul className="space-y-2">
                    {result.generalInfo.sources.map((source, index) => (
                      <li key={index}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                        >
                          {source}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Errors Section */}
          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-red-800">
                Errors
              </h3>
              <ul className="space-y-2">
                {result.errors.map((error, index) => (
                  <li
                    key={index}
                    className="text-red-700 flex items-start gap-2"
                  >
                    <svg
                      className="w-5 h-5 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
