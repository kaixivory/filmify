import React from "react";
import { MovieRecommendation } from "../types/movie";

interface MovieRecommendationsProps {
  recommendations: MovieRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
}

export function MovieRecommendations({
  recommendations,
  isLoading,
  error,
  isDarkMode,
}: MovieRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ee65e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center py-4 px-4 rounded-lg ${
          isDarkMode ? "text-red-400" : "text-red-600"
        }`}
      >
        {error}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie, index) => (
          <div
            key={index}
            className={`${
              isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
            } backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105`}
          >
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } text-lg md:text-xl font-semibold mb-2`}
              >
                {movie.title} ({movie.year})
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400">★</span>
                <span
                  className={`${
                    isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                  } text-sm`}
                >
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className={`${
                      isDarkMode
                        ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                        : "bg-[#0b1215]/20 text-[#0b1215]"
                    } px-2 py-1 rounded-full text-xs`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base`}
              >
                {movie.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
