import React from "react";

interface MovieCardProps {
  movie: {
    title: string;
    year: number;
    reason: string;
    posterUrl: string | null;
    rating: number;
    genres: Array<{ id: number; name: string }>;
    runtime: number | null;
    ageRating: string | null;
  };
  isDarkMode: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isDarkMode }) => {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg ${
        isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
      } backdrop-blur-sm transition-all duration-300`}
    >
      <div className="relative aspect-[2/3]">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              isDarkMode ? "bg-[#faf9f6]/5" : "bg-[#0b1215]/5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-12 h-12 ${
                isDarkMode ? "text-[#faf9f6]/20" : "text-[#0b1215]/20"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3
          className={`text-lg font-semibold mb-1 ${
            isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
          }`}
        >
          {movie.title} ({movie.year})
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {movie.genres.map((genre) => (
            <span
              key={genre.id}
              className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode
                  ? "bg-[#faf9f6]/10 text-[#faf9f6]"
                  : "bg-[#0b1215]/10 text-[#0b1215]"
              }`}
            >
              {genre.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm mb-2">
          {movie.runtime && (
            <span
              className={`flex items-center gap-1 ${
                isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
              }`}
            >
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {movie.runtime} min
            </span>
          )}
          {movie.ageRating && (
            <span
              className={`flex items-center gap-1 ${
                isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
              }`}
            >
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
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              {movie.ageRating}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mb-2">
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
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <span
            className={`${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            } font-medium`}
          >
            {movie.rating}/10
          </span>
        </div>
        <p
          className={`text-sm ${
            isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
          }`}
        >
          {movie.reason}
        </p>
      </div>
    </div>
  );
};
