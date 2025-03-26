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
            } backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 flex flex-col`}
          >
            <div className="w-full aspect-[2/3] flex-shrink-0 bg-black/20 flex items-center justify-center">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12 mx-auto mb-2 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">Image not available</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } text-lg md:text-xl font-semibold mb-2`}
              >
                {movie.title} ({movie.year})
              </h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span
                    className={`${
                      isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                    } text-sm`}
                  >
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-4 h-4 ${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-sm`}
                    >
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  </div>
                )}
                {movie.ageRating && (
                  <div className="flex items-center">
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-xs border ${
                        isDarkMode ? "border-[#faf9f6]" : "border-[#0b1215]"
                      } px-1.5 py-0.5 rounded`}
                    >
                      {movie.ageRating}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className={`${
                      isDarkMode
                        ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                        : "bg-[#0b1215]/20 text-[#0b1215]"
                    } px-2 py-1 rounded-full text-xs`}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base mb-4`}
              >
                {movie.reason}
              </p>
              <a
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm ${
                  isDarkMode
                    ? "text-[#0ee65e] hover:text-[#0ee65e]/80"
                    : "text-[#0baf47] hover:text-[#0baf47]/80"
                } transition-colors`}
              >
                <span>View on TMDB</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
