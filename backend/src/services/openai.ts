import OpenAI from "openai";
import { searchMovies, getMovieDetails } from "./tmdb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug logging
console.log("Environment variables loaded:", {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Present" : "Missing",
  OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MovieRecommendation {
  id: number;
  title: string;
  year: number;
  reason: string;
  posterUrl: string | null;
  rating: number;
  genres: string[];
}

export async function generateMovieRecommendations(
  playlist: any,
  numRecs: number = 5
): Promise<MovieRecommendation[]> {
  try {
    console.log("Requesting movie recommendations from OpenAI...");
    console.log(
      "Using API key:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );

    const prompt = `Based on this Spotify playlist: "${playlist.name}" with ${playlist.total} songs, recommend ${numRecs} movies that match the playlist's vibe. For each movie, provide:
1. Title
2. Release year
3. A brief explanation of why it matches the playlist's vibe

Format the response as a JSON array of objects with "title", "year", and "reason" fields.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("Received response from OpenAI API");

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    // Clean and parse the content
    // First, try to find the JSON array in the content
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in the response");
    }

    const cleanedContent = jsonMatch[0].trim();
    console.log("Cleaned content:", cleanedContent);

    const recommendations = JSON.parse(cleanedContent);

    // Fetch additional details for each movie
    const detailedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        try {
          // Search for the movie
          const searchResults = await searchMovies(rec.title);
          if (searchResults.length === 0) {
            return {
              ...rec,
              posterUrl: null,
              rating: 0,
              genres: [],
            };
          }

          // Get the first result (most relevant match)
          const movie = searchResults[0];

          // Get detailed movie info
          const details = await getMovieDetails(movie.id);

          return {
            ...rec,
            id: movie.id,
            ...details,
          };
        } catch (error) {
          console.error(`Error fetching details for ${rec.title}:`, error);
          return {
            ...rec,
            posterUrl: null,
            rating: 0,
            genres: [],
          };
        }
      })
    );

    console.log("✓ Movie recommendations generated");
    return detailedRecommendations;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `Failed to generate movie recommendations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
