import OpenAI from "openai";
import { searchMovies, getMovieDetails, getGenres } from "./tmdb";
import dotenv from "dotenv";
import { SpotifyPlaylist } from "./spotify";

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

// Genre mapping from TMDB IDs to names
const genreMap: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export interface MovieRecommendation {
  id: number;
  title: string;
  year: number;
  reason: string;
  posterUrl: string | null;
  rating: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number | null;
  ageRating: string | null;
}

export async function generateMovieRecommendations(
  playlist: SpotifyPlaylist,
  numRecs: number = 5,
  selectedGenres: number[] = []
): Promise<MovieRecommendation[]> {
  try {
    console.log("Requesting movie recommendations from OpenAI...");
    console.log(
      "Using API key:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );

    const genreFilter =
      selectedGenres.length > 0
        ? `\nIMPORTANT: Each recommended movie MUST be from at least one of these genres: ${selectedGenres
            .map((id) => genreMap[id])
            .join(", ")}.`
        : "";

    const prompt = `Based on this Spotify playlist:
${playlist.name}
${playlist.tracks
  .map(
    (track) =>
      `- ${track.name} by ${track.artists.map((a) => a.name).join(", ")}`
  )
  .join("\n")}

Recommend ${numRecs} movies that match the playlist's vibe.${genreFilter}

For each movie, provide:
1. Title
2. Year
3. A brief explanation of why it matches the playlist's energy
4. Rating (out of 10)
5. Genres (comma-separated)
6. Runtime (in minutes)
7. Age Rating (e.g., PG, PG-13, R, etc.)

IMPORTANT: Respond with a JSON array of objects in this exact format:
[
  {
    "title": "Movie Title",
    "year": 2023,
    "reason": "Explanation of why it matches the playlist's energy",
    "rating": 8.5,
    "genres": ["Genre1", "Genre2", "Genre3"],
    "runtime": 120,
    "ageRating": "PG-13"
  }
]

Make sure each recommendation is unique and diverse.`;

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
    try {
      // First, try to find the JSON array in the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON array found in the response");
      }

      const cleanedContent = jsonMatch[0].trim();
      console.log("Cleaned content:", cleanedContent);

      const recommendations = JSON.parse(cleanedContent);

      // Validate the structure of each recommendation
      if (!Array.isArray(recommendations)) {
        throw new Error("Response is not an array");
      }

      recommendations.forEach((rec, index) => {
        if (
          !rec.title ||
          !rec.year ||
          !rec.reason ||
          !rec.rating ||
          !Array.isArray(rec.genres) ||
          !rec.runtime ||
          !rec.ageRating
        ) {
          throw new Error(`Invalid recommendation structure at index ${index}`);
        }
      });

      // Fetch additional details for each movie
      const detailedRecommendations = await Promise.all(
        recommendations.map(async (rec: any) => {
          try {
            // Search for the movie
            const searchResults = await searchMovies(rec.title);
            if (searchResults.length === 0) {
              console.log(`No search results found for: ${rec.title}`);
              return {
                ...rec,
                posterUrl: null,
                rating: 0,
                genres: [],
                runtime: null,
                ageRating: null,
              };
            }

            // Get the first matching movie
            const movie = searchResults[0];
            console.log(
              `Found movie: ${movie.title} with poster path: ${movie.poster_path}`
            );

            const movieDetails = await getMovieDetails(movie.id);
            console.log(`Movie details for ${movie.title}:`, {
              poster_path: movieDetails.poster_path,
              vote_average: movieDetails.vote_average,
              genres: movieDetails.genres,
              runtime: movieDetails.runtime,
              release_dates: movieDetails.release_dates,
            });

            const posterUrl = movieDetails.poster_path
              ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}`
              : null;

            // Get US release date certification
            const usReleaseDates = movieDetails.release_dates?.results.find(
              (r) => r.iso_3166_1 === "US"
            )?.release_dates;

            // Get the most recent release date certification
            const ageRating =
              usReleaseDates && usReleaseDates.length > 0
                ? usReleaseDates[usReleaseDates.length - 1].certification
                : null;

            // Use the runtime from TMDB if available, otherwise use the one from OpenAI
            const runtime = movieDetails.runtime || rec.runtime || null;

            console.log(`Final details for ${movie.title}:`, {
              title: movie.title,
              runtime,
              ageRating,
              tmdbRuntime: movieDetails.runtime,
              openaiRuntime: rec.runtime,
              usReleaseDates: usReleaseDates,
              posterUrl,
            });

            return {
              ...rec,
              id: movie.id,
              posterUrl,
              rating: movieDetails.vote_average,
              genres: movieDetails.genres,
              runtime,
              ageRating,
            };
          } catch (error) {
            console.error("Error fetching movie details:", error);
            return {
              ...rec,
              posterUrl: null,
              rating: 0,
              genres: [],
              runtime: null,
              ageRating: null,
            };
          }
        })
      );

      console.log("✓ Movie recommendations generated");
      return detailedRecommendations;
    } catch (error) {
      console.error("Error parsing response:", error);
      throw new Error(
        `Failed to parse movie recommendations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `Failed to generate movie recommendations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
