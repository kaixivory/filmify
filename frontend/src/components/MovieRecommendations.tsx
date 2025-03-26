import React from "react";
import { MovieRecommendation } from "../types/movie";

interface MovieRecommendationsProps {
  recommendations: MovieRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
}

export const MovieRecommendations: React.FC<MovieRecommendationsProps> = ({
  recommendations,
  isLoading,
  error,
  isDarkMode,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {recommendations.map((movie, index) => (
        <div
          key={index}
          className={`${
            isDarkMode ? "bg-white/5" : "bg-black/5"
          } backdrop-blur-sm rounded-lg p-6 hover:bg-opacity-15 transition-colors`}
        >
          <div className="flex gap-6">
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="w-32 h-48 object-cover rounded-lg shadow-lg"
              />
            )}
            <div className="flex-1">
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-black"
                } mb-2`}
              >
                {movie.title} ({movie.year})
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={isDarkMode ? "text-white" : "text-black"}>
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 ${
                        isDarkMode
                          ? "bg-white/10 text-white/90"
                          : "bg-black/10 text-black/90"
                      } rounded-full text-sm`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <p className={isDarkMode ? "text-white/90" : "text-black/90"}>
                {movie.reason}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
