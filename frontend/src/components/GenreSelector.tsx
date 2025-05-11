import React, { useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface RuntimeGroup {
  label: string;
  value: string;
}

interface RatingGroup {
  label: string;
  value: string;
}

interface PreferencesSelectorProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreChange: (genreId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isDarkMode: boolean;
  selectedAgeRatings: string[];
  selectedRuntime: string[];
  selectedRatings: string[];
  onAgeRatingChange: (rating: string) => void;
  onRuntimeChange: (runtime: string) => void;
  onRatingChange: (rating: string) => void;
  onAgeRatingSelectAll: () => void;
  onAgeRatingDeselectAll: () => void;
  onRuntimeSelectAll: () => void;
  onRuntimeDeselectAll: () => void;
  onRatingSelectAll: () => void;
  onRatingDeselectAll: () => void;
}

export const AGE_RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];
export const RUNTIME_GROUPS: RuntimeGroup[] = [
  { label: "< 1 hour", value: "short" },
  { label: "1-2 hours", value: "medium" },
  { label: "> 2 hours", value: "long" },
];
export const RATING_GROUPS: RatingGroup[] = [
  { label: "0-5", value: "low" },
  { label: "5-7", value: "medium" },
  { label: "7-8", value: "high" },
  { label: "8-10", value: "excellent" },
];

export const PreferencesSelector: React.FC<PreferencesSelectorProps> = ({
  genres,
  selectedGenres,
  onGenreChange,
  onSelectAll,
  onDeselectAll,
  isDarkMode,
  selectedAgeRatings,
  selectedRuntime,
  selectedRatings,
  onAgeRatingChange,
  onRuntimeChange,
  onRatingChange,
  onAgeRatingSelectAll,
  onAgeRatingDeselectAll,
  onRuntimeSelectAll,
  onRuntimeDeselectAll,
  onRatingSelectAll,
  onRatingDeselectAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full md:w-1/2">
      <div
        className={`${
          isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
        } backdrop-blur-sm rounded-lg ${isExpanded ? "p-4" : "py-2 px-4"}`}
      >
        <div
          className={`flex justify-between items-center ${
            isExpanded ? "mb-4" : ""
          }`}
        >
          <h2
            className={`${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            } font-montserrat text-xl font-semibold`}
          >
            Preferences
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden space-y-6">
            {/* Genres Section */}
            <div>
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } font-montserrat text-lg font-semibold mb-4`}
              >
                Select Genres
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={onSelectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#0ee65e] text-[#0b1215]"
                      : "bg-[#0baf47] text-[#faf9f6]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Select All
                </button>
                <button
                  onClick={onDeselectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                      : "bg-[#0b1215]/20 text-[#0b1215]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Deselect All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {genres.map((genre) => (
                  <label
                    key={genre.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? "hover:bg-[#faf9f6]/20"
                        : "hover:bg-[#0b1215]/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => onGenreChange(genre.id)}
                      className={`w-4 h-4 rounded ${
                        isDarkMode
                          ? "text-[#0ee65e] focus:ring-[#0ee65e]"
                          : "text-[#0baf47] focus:ring-[#0baf47]"
                      }`}
                    />
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-sm`}
                    >
                      {genre.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age Rating Section */}
            <div>
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } font-montserrat text-lg font-semibold mb-4`}
              >
                Age Rating
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={onAgeRatingSelectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#0ee65e] text-[#0b1215]"
                      : "bg-[#0baf47] text-[#faf9f6]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Select All
                </button>
                <button
                  onClick={onAgeRatingDeselectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                      : "bg-[#0b1215]/20 text-[#0b1215]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Deselect All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AGE_RATINGS.map((rating) => (
                  <label
                    key={rating}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? "hover:bg-[#faf9f6]/20"
                        : "hover:bg-[#0b1215]/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgeRatings.includes(rating)}
                      onChange={() => onAgeRatingChange(rating)}
                      className={`w-4 h-4 rounded ${
                        isDarkMode
                          ? "text-[#0ee65e] focus:ring-[#0ee65e]"
                          : "text-[#0baf47] focus:ring-[#0baf47]"
                      }`}
                    />
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-sm`}
                    >
                      {rating}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Runtime Section */}
            <div>
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } font-montserrat text-lg font-semibold mb-4`}
              >
                Runtime
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={onRuntimeSelectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#0ee65e] text-[#0b1215]"
                      : "bg-[#0baf47] text-[#faf9f6]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Select All
                </button>
                <button
                  onClick={onRuntimeDeselectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                      : "bg-[#0b1215]/20 text-[#0b1215]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Deselect All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {RUNTIME_GROUPS.map(({ label, value }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? "hover:bg-[#faf9f6]/20"
                        : "hover:bg-[#0b1215]/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRuntime.includes(value)}
                      onChange={() => onRuntimeChange(value)}
                      className={`w-4 h-4 rounded ${
                        isDarkMode
                          ? "text-[#0ee65e] focus:ring-[#0ee65e]"
                          : "text-[#0baf47] focus:ring-[#0baf47]"
                      }`}
                    />
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-sm`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Section */}
            <div>
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } font-montserrat text-lg font-semibold mb-4`}
              >
                Rating
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={onRatingSelectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#0ee65e] text-[#0b1215]"
                      : "bg-[#0baf47] text-[#faf9f6]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Select All
                </button>
                <button
                  onClick={onRatingDeselectAll}
                  className={`${
                    isDarkMode
                      ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                      : "bg-[#0b1215]/20 text-[#0b1215]"
                  } px-4 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300`}
                >
                  Deselect All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {RATING_GROUPS.map(({ label, value }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? "hover:bg-[#faf9f6]/20"
                        : "hover:bg-[#0b1215]/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(value)}
                      onChange={() => onRatingChange(value)}
                      className={`w-4 h-4 rounded ${
                        isDarkMode
                          ? "text-[#0ee65e] focus:ring-[#0ee65e]"
                          : "text-[#0baf47] focus:ring-[#0baf47]"
                      }`}
                    />
                    <span
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-sm`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
