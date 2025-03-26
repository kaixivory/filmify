import axios from "axios";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

interface TMDBMovieResponse {
  results: TMDBMovie[];
}

interface MovieDetails {
  posterUrl: string | null;
  rating: number;
  genres: string[];
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    const response = await axios.get<TMDBMovieResponse>(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}`
    );

    return response.data.results;
  } catch (error) {
    console.error("TMDB API error:", error);
    throw new Error("Failed to search movies");
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    const response = await axios.get<TMDBMovie>(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
    );

    const movie = response.data;
    return {
      posterUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      rating: movie.vote_average,
      genres: movie.genres.map((genre) => genre.name),
    };
  } catch (error) {
    console.error("TMDB API error:", error);
    throw new Error("Failed to get movie details");
  }
}
