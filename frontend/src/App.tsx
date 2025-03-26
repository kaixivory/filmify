import React, { useState, useEffect } from "react";
import { MovieRecommendations } from "./components/MovieRecommendations";
import { GenreSelector } from "./components/GenreSelector";
import { MovieRecommendation } from "./types/movie";
import { API_URL } from "./config";

interface Genre {
  id: number;
  name: string;
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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyLink(event.target.value);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!spotifyLink.trim()) {
      setError("Please enter a Spotify link");
      return;
    }

    if (selectedGenres.length === 0) {
      setError("Please select at least one genre");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending request to backend...");

      // First check if the server is running
      try {
        const healthCheck = await fetch(`${API_URL}/`);
        if (!healthCheck.ok) {
          throw new Error("Backend server is not responding");
        }
      } catch (err) {
        console.error("Health check failed:", err);
        throw new Error(
          "Cannot connect to the backend server. Please make sure it's running on port 5000."
        );
      }

      const response = await fetch(`${API_URL}/api/playlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          spotifyLink,
          numRecs,
          selectedGenres,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!data.recommendations || data.recommendations.length === 0) {
        throw new Error("No recommendations were generated. Please try again.");
      }

      setRecommendations(data.recommendations);
    } catch (err) {
      console.error("Error in handleGenerate:", err);
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          setError(
            "Cannot connect to the server. Please try again in a few moments."
          );
        } else if (err.message.includes("Playlist not found")) {
          setError(
            "Could not find the Spotify playlist. Please check the link and try again."
          );
        } else if (err.message.includes("No recommendations")) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
              handleGenerate();
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

        <GenreSelector
          genres={genres}
          selectedGenres={selectedGenres}
          onGenreChange={handleGenreChange}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isDarkMode={isDarkMode}
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
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
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
        />

        <div className="mt-4 mb-24 space-y-8 px-4 md:px-8 lg:px-12 w-full">
          <h2
            className={`${
              isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
            } text-xl md:text-2xl font-bold text-center mb-6`}
          >
            How it works
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
                } text-sm md:text-base`}
              >
                Copy and paste your Spotify playlist link into the input box
                above.
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
                2. Analyze Mood
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base`}
              >
                Our AI analyzes the songs, artists, and overall vibe of your
                playlist.
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
                3. Get Recommendations
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-[#faf9f6]/80" : "text-[#0b1215]/80"
                } text-sm md:text-base`}
              >
                Receive personalized movie recommendations that match your
                playlist's energy.
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
      </footer>
    </div>
  );
}

export default App;
