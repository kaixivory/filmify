import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is required");
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  release_dates: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
      }>;
    }>;
  };
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  release_dates: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
      }>;
    }>;
  };
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  try {
    console.log(`Searching TMDB for: ${query}`);
    const response = await axios.get<TMDBSearchResponse>(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.TMDB_API_KEY
      }&query=${encodeURIComponent(
        query
      )}&language=en-US&page=1&include_adult=false`
    );

    console.log(`Found ${response.data.results.length} results for ${query}`);
    response.data.results.forEach((movie) => {
      console.log(`Movie: ${movie.title}, Poster path: ${movie.poster_path}`);
    });

    return response.data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw new Error("Failed to search movies");
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  try {
    const response = await axios.get<TMDBMovieResponse>(
      `${TMDB_API_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=release_dates`
    );

    const movie = response.data;
    console.log("Raw TMDB response:", {
      id: movie.id,
      title: movie.title,
      runtime: movie.runtime,
      release_dates: movie.release_dates,
    });

    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genres: movie.genres,
      runtime: movie.runtime,
      release_dates: movie.release_dates,
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw new Error("Failed to fetch movie details");
  }
}

export async function getGenres(): Promise<TMDBGenre[]> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    console.log("Fetching genres from TMDB...");
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en`;
    console.log("Request URL:", url);

    const response = await axios.get<TMDBGenresResponse>(url);
    console.log("TMDB response status:", response.status);
    console.log("TMDB response data:", response.data);

    return response.data.genres;
  } catch (error: any) {
    console.error("TMDB API error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error("Failed to fetch genres");
  }
}
