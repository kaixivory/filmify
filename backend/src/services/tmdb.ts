import axios from "axios";

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

interface TMDBResponse {
  results: TMDBMovie[];
}

interface MovieDetails {
  posterUrl: string | null;
  rating: number;
  genres: string[];
}

export async function getMovieDetails(
  title: string,
  year: number
): Promise<MovieDetails | null> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    // Search for the movie
    const searchResponse = await axios.get<TMDBResponse>(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: apiKey,
          query: title,
          year: year,
        },
      }
    );

    if (searchResponse.data.results.length === 0) {
      return null;
    }

    // Get the first result (most relevant match)
    const movie = searchResponse.data.results[0];

    // If no poster path, return null
    if (!movie.poster_path) {
      return null;
    }

    // Get detailed movie info including genres
    const detailsResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movie.id}`,
      {
        params: {
          api_key: apiKey,
        },
      }
    );

    const details = detailsResponse.data;

    return {
      posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      rating: details.vote_average,
      genres: details.genres.map((genre: { name: string }) => genre.name),
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}
