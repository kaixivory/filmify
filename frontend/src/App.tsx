import React, { useState, useEffect } from "react";
import { MovieRecommendations } from "./components/MovieRecommendations";
import {
  PreferencesSelector,
  AGE_RATINGS,
  RUNTIME_GROUPS,
  RATING_GROUPS,
} from "./components/GenreSelector";
import { MovieRecommendation } from "./types/movie";
import { API_URL } from "./config";

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

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [numRecs, setNumRecs] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>(
    []
  );
  const [playlistName, setPlaylistName] = useState<string>("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedAgeRatings, setSelectedAgeRatings] =
    useState<string[]>(AGE_RATINGS);
  const [selectedRuntime, setSelectedRuntime] = useState<string[]>(
    RUNTIME_GROUPS.map((group: RuntimeGroup) => group.value)
  );
  const [selectedRatings, setSelectedRatings] = useState<string[]>(
    RATING_GROUPS.map((group: RatingGroup) => group.value)
  );

  useEffect(() => {
    // Fetch genres when the app loads
    const fetchGenres = async () => {
      try {
        console.log("Fetching genres from:", `${API_URL}/api/genres`);
        const response = await fetch(`${API_URL}/api/genres`);
        console.log("Genre response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }
        const data = await response.json();
        console.log("Received genres:", data);
        setGenres(data);
        // Select all genres by default
        setSelectedGenres(data.map((genre: Genre) => genre.id));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreChange = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSelectAll = () => {
    setSelectedGenres(genres.map((genre) => genre.id));
  };

  const handleDeselectAll = () => {
    setSelectedGenres([]);
  };

  const handleAgeRatingChange = (rating: string) => {
    setSelectedAgeRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const handleRuntimeChange = (runtime: string) => {
    setSelectedRuntime((prev) =>
      prev.includes(runtime)
        ? prev.filter((r) => r !== runtime)
        : [...prev, runtime]
    );
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const handleAgeRatingSelectAll = () => {
    setSelectedAgeRatings(AGE_RATINGS);
  };

  const handleAgeRatingDeselectAll = () => {
    setSelectedAgeRatings([]);
  };

  const handleRuntimeSelectAll = () => {
    setSelectedRuntime(RUNTIME_GROUPS.map((group) => group.value));
  };

  const handleRuntimeDeselectAll = () => {
    setSelectedRuntime([]);
  };

  const handleRatingSelectAll = () => {
    setSelectedRatings(RATING_GROUPS.map((group) => group.value));
  };

  const handleRatingDeselectAll = () => {
    setSelectedRatings([]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyLink(event.target.value);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate selections
    if (selectedGenres.length === 0) {
      setError("Please select at least one genre");
      setIsLoading(false);
      return;
    }
    if (selectedAgeRatings.length === 0) {
      setError("Please select at least one age rating");
      setIsLoading(false);
      return;
    }
    if (selectedRuntime.length === 0) {
      setError("Please select at least one runtime range");
      setIsLoading(false);
      return;
    }
    if (selectedRatings.length === 0) {
      setError("Please select at least one rating range");
      setIsLoading(false);
      return;
    }

    const requestBody = {
      spotifyLink,
      numRecs,
      selectedGenres,
      selectedAgeRatings,
      selectedRuntime,
      selectedRatings,
    };

    console.log("Debug - Request Body:", requestBody);

    try {
      const response = await fetch(`${API_URL}/api/playlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate recommendations"
        );
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setPlaylistName(data.playlist.name);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`App ${
        isDarkMode ? "bg-[#0b1215]" : "bg-[#faf9f6]"
      } min-h-screen relative transition-colors duration-300`}
    >
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors"
      >
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="black"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        )}
      </button>
      <div className="flex flex-col justify-center items-center min-h-screen py-8 px-4 md:px-8 gap-4">
        <h1
          className={`${
            isDarkMode ? "text-[#0ee65e]" : "text-[#0baf47]"
          } font-poppins text-4xl md:text-6xl font-extrabold mb-2 transition-colors duration-300 text-center`}
        >
          filmify.ai
        </h1>
        <h2
          className={`${
            isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
          } font-montserrat text-lg md:text-xl mb-4 transition-colors duration-300 text-center px-4`}
        >
          🎼🎵 discover movies inspired by your favorite music 🎥🍿
        </h2>
        <hr
          className={`w-full md:w-2/3 ${
            isDarkMode ? "border-[#faf9f6]" : "border-[#0b1215]"
          } mb-4 border-[1.25px] transition-colors duration-300`}
        />

        <input
          type="text"
          placeholder="Paste a Spotify link"
          value={spotifyLink}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSubmit(e);
            }
          }}
          className={`rounded-full px-4 py-2 w-full md:w-1/2 ${
            isDarkMode
              ? "bg-[#faf9f6] text-[#0b1215]"
              : "bg-[#0b1215] text-[#faf9f6]"
          } ${
            isDarkMode ? "placeholder-gray-400" : "placeholder-gray-400"
          } focus:outline-none transition-all duration-300 mb-6`}
        />

        <PreferencesSelector
          genres={genres}
          selectedGenres={selectedGenres}
          onGenreChange={handleGenreChange}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isDarkMode={isDarkMode}
          selectedAgeRatings={selectedAgeRatings}
          selectedRuntime={selectedRuntime}
          selectedRatings={selectedRatings}
          onAgeRatingChange={handleAgeRatingChange}
          onRuntimeChange={handleRuntimeChange}
          onRatingChange={handleRatingChange}
          onAgeRatingSelectAll={handleAgeRatingSelectAll}
          onAgeRatingDeselectAll={handleAgeRatingDeselectAll}
          onRuntimeSelectAll={handleRuntimeSelectAll}
          onRuntimeDeselectAll={handleRuntimeDeselectAll}
          onRatingSelectAll={handleRatingSelectAll}
          onRatingDeselectAll={handleRatingDeselectAll}
        />

        <div className="flex items-center gap-2">
          <label
            className={`${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            } font-montserrat text-sm transition-colors duration-300`}
          >
            # of recs
          </label>
          <select
            value={numRecs}
            onChange={(e) => setNumRecs(Number(e.target.value))}
            className={`rounded-full px-2 py-1 w-12 ${
              isDarkMode
                ? "bg-[#faf9f6] text-[#0b1215]"
                : "bg-[#0b1215] text-[#faf9f6]"
            } focus:outline-none font-montserrat text-sm text-center transition-all duration-300`}
          >
            {[...Array(9)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`${
            isDarkMode
              ? "bg-[#0ee65e] text-[#0b1215]"
              : "bg-[#0baf47] text-[#faf9f6]"
          } px-8 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-300 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          } flex items-center gap-2 w-full md:w-auto justify-center`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </button>
        <hr
          className={`w-full md:w-2/3 ${
            isDarkMode ? "border-[#faf9f6]" : "border-[#0b1215]"
          } my-4 border-[1.25px] transition-colors duration-300`}
        />

        <MovieRecommendations
          recommendations={recommendations}
          isLoading={isLoading}
          error={error}
          isDarkMode={isDarkMode}
          playlistName={playlistName}
        />

        <div className="mt-4 mb-24 space-y-8 px-4 md:px-8 lg:px-12 w-full">
          <h2
            className={`${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            } text-xl md:text-2xl font-bold text-center mb-6`}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div
              className={`${
                isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
              } backdrop-blur-sm rounded-lg p-6`}
            >
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } text-lg md:text-xl font-semibold mb-2`}
              >
                1. Share Your Playlist
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base leading-relaxed`}
              >
                Open Spotify and find your playlist. Click the{" "}
                <strong>three dots menu (⋯)</strong> next to the playlist, then
                click <strong>"Share"</strong> and select{" "}
                <strong>"Copy link to playlist"</strong>. <strong>Paste</strong>{" "}
                the link into the input box above.{" "}
                <em>
                  (note: make sure your playlist is <strong>public</strong> so
                  we can access it.
                </em>
              </p>
            </div>
            <div
              className={`${
                isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
              } backdrop-blur-sm rounded-lg p-6`}
            >
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } text-lg md:text-xl font-semibold mb-2`}
              >
                2. Customize Your Search
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base leading-relaxed`}
              >
                Select your <strong>preferences</strong> from the dropdown menu.
                Then, choose <strong>how many</strong> movie recommendations
                you'd like to receive. This helps <strong>tailor</strong> the
                results to <em>your</em> needs.
              </p>
            </div>
            <div
              className={`${
                isDarkMode ? "bg-[#faf9f6]/10" : "bg-[#0b1215]/10"
              } backdrop-blur-sm rounded-lg p-6`}
            >
              <h3
                className={`${
                  isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                } text-lg md:text-xl font-semibold mb-2`}
              >
                3. Generate & Explore
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base leading-relaxed`}
              >
                Click the <strong>"Generate"</strong> button and wait while our
                AI analyzes your playlist. You'll receive personalized movie
                recommendations that match your playlist's vibe and be able to
                view detailed information about your picks. Click{" "}
                <strong>"View on TMDB"</strong> to learn more about any movie
                that interests you.{" "}
                <em>Want to share your recommendations with friends?</em> Click
                the <strong>"Share"</strong> button and you'll receive a
                saveable image of your recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer
        className={`absolute bottom-4 w-full text-center ${
          isDarkMode ? "text-gray-300" : "text-gray-500"
        } font-montserrat text-xs transition-colors duration-300 px-4`}
      >
        Made with {isDarkMode ? "🤍" : "🖤"} by Kailani
        <div className="flex items-center justify-center gap-4 mt-2">
          <a
            href="https://github.com/kaixivory"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:opacity-80 transition-opacity ${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <a
            href="https://open.spotify.com/user/cc04ev37msusv2zz2bbhpbidj?si=48735063f2ee4599"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:opacity-80 transition-opacity ${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
