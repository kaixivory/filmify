import OpenAI from "openai";
import { SpotifyPlaylist } from "./spotify";
import { getMovieDetails } from "./tmdb";
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
  title: string;
  year: number;
  reason: string;
  posterUrl: string | null;
  rating: number;
  genres: string[];
}

export async function generateMovieRecommendations(
  playlist: SpotifyPlaylist,
  numRecs: number = 5
): Promise<MovieRecommendation[]> {
  try {
    console.log("Requesting movie recommendations from OpenAI...");
    console.log(
      "Using API key:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );

    const prompt = `Based on this Spotify playlist: "${playlist.name}" with ${playlist.total} songs, recommend ${numRecs} movies that match the mood and themes. For each movie, provide:
1. Title
2. Release year
3. A brief explanation of why it matches the playlist's vibe

Format the response as a JSON array of objects with "title", "year", and "reason" properties.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation expert. Provide thoughtful, well-reasoned movie suggestions based on music playlists.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("Received response from OpenAI API");

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    // Clean the content by removing markdown formatting
    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    console.log("Cleaned content:", cleanContent);

    const recommendations = JSON.parse(cleanContent);

    if (!Array.isArray(recommendations)) {
      throw new Error("Invalid response format from OpenAI API");
    }

    // Fetch details for each recommendation
    const recommendationsWithDetails = await Promise.all(
      recommendations.map(async (rec) => {
        const details = await getMovieDetails(rec.title, rec.year);
        return {
          ...rec,
          posterUrl: details?.posterUrl || null,
          rating: details?.rating || 0,
          genres: details?.genres || [],
        };
      })
    );

    console.log("✓ Movie recommendations generated");
    return recommendationsWithDetails;
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to generate movie recommendations: ${error.message}`
      );
    }
    throw new Error("Failed to generate movie recommendations");
  }
}
