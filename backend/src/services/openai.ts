import OpenAI from "openai";
import { searchMovies, getMovieDetails, getGenres } from "./tmdb";
import dotenv from "dotenv";
import { SpotifyPlaylist } from "./spotify";
import {
  AGE_RATINGS,
  RUNTIME_GROUPS,
  RATING_GROUPS,
} from "../types/preferences";

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

// Add this new function after the genreMap
async function getMatchingMovies(
  selectedGenres: number[],
  selectedAgeRatings: string[],
  selectedRuntime: string[],
  selectedRatings: string[],
  page: number = 1
): Promise<any[]> {
  try {
    // Check if all preferences are selected
    const isAllSelected =
      selectedGenres.length === Object.keys(genreMap).length &&
      selectedAgeRatings.length === AGE_RATINGS.length &&
      selectedRuntime.length === RUNTIME_GROUPS.length &&
      selectedRatings.length === RATING_GROUPS.length;

    // Fetch 25 pages (500 movies) when all preferences are selected, otherwise 20 pages
    const pagesToFetch = isAllSelected ? 25 : 20;

    console.log("Debug - Selection state:", {
      isAllSelected,
      selectedGenresCount: selectedGenres.length,
      totalGenres: Object.keys(genreMap).length,
      selectedAgeRatingsCount: selectedAgeRatings.length,
      totalAgeRatings: AGE_RATINGS.length,
      selectedRuntimeCount: selectedRuntime.length,
      totalRuntime: RUNTIME_GROUPS.length,
      selectedRatingsCount: selectedRatings.length,
      totalRatings: RATING_GROUPS.length,
    });

    // If all genres are selected, use a single API call without genre filter
    const genreMovies =
      selectedGenres.length === Object.keys(genreMap).length
        ? await Promise.all(
            Array.from({ length: pagesToFetch }, (_, i) => i + 1).map(
              async (pageNum) => {
                const response = await fetch(
                  `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${pageNum}&sort_by=popularity.desc&include_adult=false&language=en-US`
                );
                const data = await response.json();
                console.log(`Debug - Page ${pageNum} response:`, {
                  totalResults: data.total_results,
                  totalPages: data.total_pages,
                  page: data.page,
                  resultsCount: data.results?.length || 0,
                });
                return data;
              }
            )
          )
        : await Promise.all(
            selectedGenres.flatMap((genreId) =>
              Array.from({ length: pagesToFetch }, (_, i) => i + 1).map(
                async (pageNum) => {
                  const response = await fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&page=${pageNum}&sort_by=popularity.desc&include_adult=false&language=en-US`
                  );
                  const data = await response.json();
                  console.log(
                    `Debug - Genre ${genreId} Page ${pageNum} response:`,
                    {
                      totalResults: data.total_results,
                      totalPages: data.total_pages,
                      page: data.page,
                      resultsCount: data.results?.length || 0,
                    }
                  );
                  return data;
                }
              )
            )
          );

    // Combine and deduplicate movies
    const allMovies = genreMovies.flatMap((response) => {
      if (!response.results) {
        console.log("Debug - Empty response:", response);
        return [];
      }
      return response.results;
    });

    const uniqueMovies = Array.from(
      new Map(allMovies.map((movie) => [movie.id, movie])).values()
    );

    console.log("Debug - Initial movie counts:", {
      totalMovies: allMovies.length,
      uniqueMovies: uniqueMovies.length,
      pagesFetched: pagesToFetch,
      responsesReceived: genreMovies.length,
      expectedMovies: pagesToFetch * 20, // TMDB returns 20 movies per page
    });

    // If all preferences are selected, return all movies without filtering
    if (isAllSelected) {
      const detailedMovies = await Promise.all(
        uniqueMovies.map(async (movie) => {
          try {
            const details = await getMovieDetails(movie.id);
            return {
              id: movie.id,
              title: movie.title,
              year: new Date(movie.release_date).getFullYear(),
              rating: details.vote_average,
              genres: details.genres,
              runtime: details.runtime,
              ageRating:
                details.release_dates?.results.find(
                  (r) => r.iso_3166_1 === "US"
                )?.release_dates[0]?.certification || null,
              overview: movie.overview,
              poster_path: movie.poster_path,
            };
          } catch (error) {
            console.error(
              `Error getting details for movie ${movie.id}:`,
              error
            );
            return null;
          }
        })
      );

      const filteredMovies = detailedMovies.filter(Boolean);
      console.log("Debug - Final movie count (all selected):", {
        filteredMovies: filteredMovies.length,
        expectedMovies: pagesToFetch * 20,
        difference: pagesToFetch * 20 - filteredMovies.length,
      });

      return filteredMovies;
    }

    // Get detailed info for each movie with filtering
    const detailedMovies = await Promise.all(
      uniqueMovies.map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.id);

          // Check runtime
          const runtime = details.runtime;
          const runtimeMatch = selectedRuntime.some((range) => {
            switch (range) {
              case "short":
                return runtime < 60;
              case "medium":
                return runtime >= 60 && runtime <= 120;
              case "long":
                return runtime > 120;
              default:
                return false;
            }
          });

          // Check rating
          const rating = details.vote_average;
          const ratingMatch = selectedRatings.some((range) => {
            switch (range) {
              case "low":
                return rating >= 0 && rating <= 5;
              case "medium":
                return rating > 5 && rating <= 7;
              case "high":
                return rating > 7 && rating <= 8;
              case "excellent":
                return rating > 8 && rating <= 10;
              default:
                return false;
            }
          });

          // Check age rating
          const usReleaseDates = details.release_dates?.results.find(
            (r) => r.iso_3166_1 === "US"
          )?.release_dates;
          const ageRating =
            usReleaseDates && usReleaseDates.length > 0
              ? usReleaseDates[usReleaseDates.length - 1].certification
              : null;
          const ageRatingMatch = selectedAgeRatings.includes(ageRating || "");

          if (!runtimeMatch || !ratingMatch || !ageRatingMatch) {
            console.log("Debug - Movie filtered out:", {
              title: movie.title,
              runtime,
              runtimeMatch,
              rating,
              ratingMatch,
              ageRating,
              ageRatingMatch,
            });
          }

          if (runtimeMatch && ratingMatch && ageRatingMatch) {
            return {
              id: movie.id,
              title: movie.title,
              year: new Date(movie.release_date).getFullYear(),
              rating: details.vote_average,
              genres: details.genres,
              runtime: details.runtime,
              ageRating: ageRating,
              overview: movie.overview,
              poster_path: movie.poster_path,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error getting details for movie ${movie.id}:`, error);
          return null;
        }
      })
    );

    const filteredMovies = detailedMovies.filter(Boolean);
    console.log("Debug - Final movie count:", {
      filteredMovies: filteredMovies.length,
    });

    return filteredMovies;
  } catch (error) {
    console.error("Error getting matching movies:", error);
    return [];
  }
}

// Export the existing getMatchingMovies function
export { getMatchingMovies };

// Modify the generateMovieRecommendations function
export async function generateMovieRecommendations(
  playlist: SpotifyPlaylist,
  numRecs: number = 5,
  selectedGenres: number[] = [],
  selectedAgeRatings: string[] = [],
  selectedRuntime: string[] = [],
  selectedRatings: string[] = []
): Promise<MovieRecommendation[]> {
  try {
    // Check if any section has no selections
    if (selectedGenres.length === 0) {
      throw new Error("Please select at least one genre");
    }
    if (selectedAgeRatings.length === 0) {
      throw new Error("Please select at least one age rating");
    }
    if (selectedRuntime.length === 0) {
      throw new Error("Please select at least one runtime range");
    }
    if (selectedRatings.length === 0) {
      throw new Error("Please select at least one rating range");
    }

    // Stage 1: Finding movies
    console.log("Getting matching movies from TMDB...");
    const matchingMovies = await getMatchingMovies(
      selectedGenres,
      selectedAgeRatings,
      selectedRuntime,
      selectedRatings
    );

    if (matchingMovies.length === 0) {
      throw new Error("No movies found matching the selected preferences");
    }

    console.log(`Found ${matchingMovies.length} matching movies`);

    // Stage 2: Analyzing playlist
    console.log("Analyzing playlist...");
    // Create a numbered list of movies for the AI to choose from
    const movieList = matchingMovies
      .filter(
        (movie) =>
          movie.title &&
          movie.year &&
          movie.genres &&
          movie.genres.length > 0 &&
          movie.rating &&
          movie.runtime &&
          movie.ageRating &&
          movie.overview
      )
      .map((movie, index) => ({
        number: index + 1,
        title: movie.title,
        year: movie.year,
        genres: movie.genres.map((g) => g.name).join(", "),
        rating: movie.rating,
        runtime: movie.runtime,
        ageRating: movie.ageRating,
        overview: movie.overview,
      }));

    if (movieList.length === 0) {
      throw new Error("No valid movies found after filtering null parameters");
    }

    // Create the prompt with the matching movies
    const prompt = [
      `Based on this Spotify playlist, recommend EXACTLY ${numRecs} movies from the following list that best match its vibe:`,
      playlist.name,
      playlist.tracks
        .map(
          (track) =>
            `- ${track.name} by ${track.artists.map((a) => a.name).join(", ")}`
        )
        .join("\n"),
      "",
      "IMPORTANT RULES:",
      "1. You MUST select EXACTLY ${numRecs} movies from this list.",
      "2. You MUST use the EXACT movie titles as shown in the list.",
      "3. You CANNOT suggest any movies that are not in this list.",
      "4. Each movie must be selected by its number from the list.",
      "",
      "Available movies (select by number):",
      ...movieList.map(
        (movie) =>
          `${movie.number}. "${movie.title}" (${movie.year}): ${movie.genres}, ` +
          `Rating: ${movie.rating}, Runtime: ${movie.runtime}min, Age Rating: ${movie.ageRating}, ` +
          `Overview: ${movie.overview}`
      ),
      "",
      `Return a JSON array with EXACTLY ${numRecs} objects, each containing:`,
      `{
        "number": number from the list above,
        "title": "EXACT movie title from the list above",
        "year": year number,
        "reason": "explanation of how it connects with the playlist (max 700 chars)"
      }`,
      "",
      "For each movie, explain how it connects with the playlist by referencing specific songs and their themes, moods, or styles. For example: 'The movie's themes of [theme] connect with [Song Name]'s [specific aspect], while its [movie aspect] matches the mood of [Another Song]'.",
    ].join("\n");

    // Stage 3: Receiving recommendations
    console.log("Receiving recommendations from AI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON array found in response");
      }

      const recommendations = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(recommendations)) {
        throw new Error("Response is not an array");
      }

      // Validate that all recommendations are from the list
      const invalidRecommendations = recommendations.filter(
        (rec) => !movieList.some((movie) => movie.title === rec.title)
      );

      if (invalidRecommendations.length > 0) {
        console.error("Invalid recommendations found:", invalidRecommendations);
        throw new Error(
          "AI generated recommendations not from the provided list"
        );
      }

      // Map the recommendations to the full movie details
      const detailedRecommendations = recommendations
        .map((rec) => {
          const movie = matchingMovies.find((m) => m.title === rec.title);
          if (!movie) {
            console.error(`Movie not found in list: ${rec.title}`);
            return null;
          }

          return {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            reason: rec.reason,
            posterUrl: movie.poster_path
              ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
              : null,
            rating: movie.rating,
            genres: movie.genres,
            runtime: movie.runtime,
            ageRating: movie.ageRating,
          };
        })
        .filter(Boolean);

      // If we don't have enough recommendations, throw an error
      if (detailedRecommendations.length !== numRecs) {
        throw new Error(
          `Failed to generate exactly ${numRecs} movie recommendations. Got ${detailedRecommendations.length} instead.`
        );
      }

      return detailedRecommendations;
    } catch (error) {
      console.error("Error parsing response:", error);
      throw new Error(
        `Failed to generate movie recommendations: ${
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

// Optimize the additional recommendations function
async function generateAdditionalRecommendations(
  playlist: SpotifyPlaylist,
  numRecs: number,
  selectedGenres: number[],
  selectedAgeRatings: string[],
  selectedRuntime: string[],
  selectedRatings: string[]
): Promise<MovieRecommendation[]> {
  const genreFilter =
    selectedGenres.length > 0 &&
    selectedGenres.length < Object.keys(genreMap).length
      ? `\nIMPORTANT: Each movie MUST be from at least one of these genres: ${selectedGenres
          .map((id) => genreMap[id])
          .filter(Boolean)
          .join(", ")}.`
      : "";

  const ageRatingFilter =
    selectedAgeRatings.length > 0 && selectedAgeRatings.length < 5
      ? `\nIMPORTANT: Each movie MUST have one of these age ratings: ${selectedAgeRatings.join(
          ", "
        )}.`
      : "";

  // Map runtime values to their display labels
  const runtimeLabels = {
    short: "< 1 hour",
    medium: "1-2 hours",
    long: "> 2 hours",
  };
  const runtimeFilter =
    selectedRuntime.length > 0 && selectedRuntime.length < 3
      ? `\nIMPORTANT: Each movie MUST have a runtime in one of these ranges: ${selectedRuntime
          .map(
            (runtime) => runtimeLabels[runtime as keyof typeof runtimeLabels]
          )
          .join(", ")}.`
      : "";

  // Map rating values to their display labels
  const ratingLabels = {
    low: "0-5 (low rated movies)",
    medium: "5-7 (average rated movies)",
    high: "7-8 (well rated movies)",
    excellent: "8-10 (highly rated movies)",
  };
  const ratingFilter =
    selectedRatings.length > 0 && selectedRatings.length < 4
      ? `\nIMPORTANT: Each movie MUST have a rating in one of these ranges: ${selectedRatings
          .map((rating) => ratingLabels[rating as keyof typeof ratingLabels])
          .join(", ")}.`
      : "";

  const additionalPrompt = [
    `Based on this Spotify playlist, recommend ${numRecs} DIFFERENT movies that match its vibe:`,
    playlist.name,
    playlist.tracks
      .map(
        (track) =>
          `- ${track.name} by ${track.artists.map((a) => a.name).join(", ")}`
      )
      .join("\n"),
    "",
    "PREFERENCE REQUIREMENTS:",
    ...(genreFilter ? [genreFilter] : []),
    ...(ageRatingFilter ? [ageRatingFilter] : []),
    ...(runtimeFilter ? [runtimeFilter] : []),
    ...(ratingFilter ? [ratingFilter] : []),
    "",
    "Format as JSON array with: title, year, reason, rating (0-10), genres (array), runtime (minutes), ageRating.",
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: additionalPrompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    return [];
  }

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    let cleanedContent = jsonMatch[0]
      .trim()
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .replace(/"reason":\s*"([^"]*?)"/g, (match, p1) => {
        return `"reason": "${p1.replace(/"/g, '\\"').replace(/\\/g, "\\\\")}"`;
      })
      .replace(/"genres":\s*\[([^\]]*?)\]/g, (match, p1) => {
        const cleanedGenres = p1
          .split(",")
          .map((genre) => genre.trim().replace(/"/g, ""))
          .filter((genre) => genre.length > 0)
          .map((genre) => `"${genre.replace(/\\/g, "\\\\")}"`);
        return `"genres": [${cleanedGenres.join(", ")}]`;
      })
      .replace(/"title":\s*"([^"]*?)"/g, (match, p1) => {
        return `"title": "${p1.replace(/"/g, '\\"').replace(/\\/g, "\\\\")}"`;
      })
      .replace(/"ageRating":\s*"([^"]*?)"/g, (match, p1) => {
        return `"ageRating": "${p1
          .replace(/"/g, '\\"')
          .replace(/\\/g, "\\\\")}"`;
      })
      .replace(/,(\s*[}\]])/g, "$1");

    const recommendations = JSON.parse(cleanedContent);

    // Process movie details in parallel with batching
    const batchSize = 5;
    const detailedRecommendations: MovieRecommendation[] = [];

    for (let i = 0; i < recommendations.length; i += batchSize) {
      const batch = recommendations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (rec: any) => {
          try {
            const searchResults = await searchMovies(rec.title);
            if (searchResults.length === 0) {
              return {
                ...rec,
                posterUrl: null,
                rating: 0,
                genres: [],
                runtime: null,
                ageRating: null,
              };
            }

            const movie = searchResults[0];
            const movieDetails = await getMovieDetails(movie.id);

            const posterUrl = movieDetails.poster_path
              ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}`
              : null;

            const usReleaseDates = movieDetails.release_dates?.results.find(
              (r) => r.iso_3166_1 === "US"
            )?.release_dates;

            const ageRating =
              usReleaseDates && usReleaseDates.length > 0
                ? usReleaseDates[usReleaseDates.length - 1].certification
                : null;

            const runtime = movieDetails.runtime || rec.runtime || null;

            // Check if the AI's recommendation matches TMDB data
            const tmdbGenres = movieDetails.genres.map((g) => g.name);
            const aiGenres = rec.genres;
            const genreMismatch = !aiGenres.every((g) =>
              tmdbGenres.includes(g)
            );

            const ratingMismatch =
              Math.abs(movieDetails.vote_average - rec.rating) > 0.5;
            const runtimeMismatch =
              runtime && Math.abs(runtime - rec.runtime) > 5;
            const ageRatingMismatch = ageRating && ageRating !== rec.ageRating;

            if (
              genreMismatch ||
              ratingMismatch ||
              runtimeMismatch ||
              ageRatingMismatch
            ) {
              console.log(`Debug - Mismatch found for "${rec.title}":`, {
                genreMismatch,
                ratingMismatch,
                runtimeMismatch,
                ageRatingMismatch,
                tmdbData: {
                  genres: tmdbGenres,
                  rating: movieDetails.vote_average,
                  runtime,
                  ageRating,
                },
                aiData: {
                  genres: aiGenres,
                  rating: rec.rating,
                  runtime: rec.runtime,
                  ageRating: rec.ageRating,
                },
              });

              // Request a new movie recommendation
              const correctionPrompt = [
                `The movie "${rec.title}" doesn't match the required preferences. Please recommend a different movie that matches:`,
                "",
                `Genres: ${selectedGenres
                  .map((id) => genreMap[id])
                  .join(", ")}`,
                `Age Ratings: ${selectedAgeRatings.join(", ")}`,
                `Runtime: ${selectedRuntime
                  .map(
                    (runtime) =>
                      runtimeLabels[runtime as keyof typeof runtimeLabels]
                  )
                  .join(", ")}`,
                `Ratings: ${selectedRatings
                  .map(
                    (rating) =>
                      ratingLabels[rating as keyof typeof ratingLabels]
                  )
                  .join(", ")}`,
                "",
                "Playlist:",
                playlist.name,
                playlist.tracks
                  .map(
                    (track) =>
                      `- ${track.name} by ${track.artists
                        .map((a) => a.name)
                        .join(", ")}`
                  )
                  .join("\n"),
                "",
                `Format as JSON array with: title, year, reason (max 100 chars), rating (0-10), genres (array), runtime (minutes), ageRating.`,
              ].join("\n");

              const correction = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: correctionPrompt }],
                temperature: 0.7,
                max_tokens: 200,
              });

              const correctedContent = correction.choices[0].message.content;
              if (!correctedContent) {
                return null; // Skip this movie
              }

              try {
                const jsonMatch = correctedContent.match(/\[[\s\S]*\]/);
                if (!jsonMatch) {
                  return null; // Skip this movie
                }

                const correctedRec = JSON.parse(jsonMatch[0])[0];
                if (!correctedRec) {
                  return null; // Skip this movie
                }

                // Search for the new movie
                const newSearchResults = await searchMovies(correctedRec.title);
                if (newSearchResults.length === 0) {
                  return null; // Skip this movie
                }

                const newMovie = newSearchResults[0];
                const newMovieDetails = await getMovieDetails(newMovie.id);

                return {
                  id: newMovie.id,
                  title: correctedRec.title,
                  year: correctedRec.year,
                  reason: correctedRec.reason,
                  posterUrl: newMovieDetails.poster_path
                    ? `${TMDB_IMAGE_BASE_URL}${newMovieDetails.poster_path}`
                    : null,
                  rating: newMovieDetails.vote_average,
                  genres: newMovieDetails.genres,
                  runtime:
                    newMovieDetails.runtime || correctedRec.runtime || null,
                  ageRating:
                    newMovieDetails.release_dates?.results.find(
                      (r) => r.iso_3166_1 === "US"
                    )?.release_dates[0]?.certification || null,
                };
              } catch (error) {
                console.error(
                  "Error processing corrected recommendation:",
                  error
                );
                return null; // Skip this movie
              }
            }

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
            console.error(
              `Error fetching additional details for ${rec.title}:`,
              error
            );
            return null; // Skip this movie
          }
        })
      );
      detailedRecommendations.push(...batchResults.filter(Boolean));
    }

    return detailedRecommendations
      .filter((movie) => {
        // Check if movie rating falls within any of the selected ranges
        const rating = movie.rating;
        return selectedRatings.some((ratingRange) => {
          switch (ratingRange) {
            case "low":
              return rating >= 0 && rating <= 5;
            case "medium":
              return rating > 5 && rating <= 7;
            case "high":
              return rating > 7 && rating <= 8;
            case "excellent":
              return rating > 8 && rating <= 10;
            default:
              return false;
          }
        });
      })
      .slice(0, numRecs);
  } catch (error) {
    console.error("Error parsing additional recommendations:", error);
    return [];
  }
}
