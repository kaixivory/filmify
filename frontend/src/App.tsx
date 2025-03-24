import React, { useState } from "react";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div
      className={`App ${
        isDarkMode ? "bg-[#121212]" : "bg-[#f8f8f8]"
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
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h1
          className={`${
            isDarkMode ? "text-[#0ee65e]" : "text-[#1db954]"
          } font-poppins text-6xl font-extrabold mb-2 transition-colors duration-300`}
        >
          filmify.
        </h1>
        <h2
          className={`${
            isDarkMode ? "text-white" : "text-gray-700"
          } font-montserrat text-xl mb-4 transition-colors duration-300`}
        >
          discover movies inspired by your favorite music
        </h2>
        <hr
          className={`w-2/3 ${
            isDarkMode ? "border-white" : "border-black"
          } mb-4 border-[1.25px] transition-colors duration-300`}
        />
        <div className="text-center mb-6">
          <h3
            className={`${
              isDarkMode ? "text-[#0ee65e]" : "text-[#1db954]"
            } font-montserrat text-lg mb-2 font-semibold transition-colors duration-300`}
          >
            how it works
          </h3>
          <div
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            } font-montserrat text-sm space-y-1 transition-colors duration-300`}
          >
            <p>
              1. paste your a link to any spotify playlist/song{" "}
              <span className="italic">
                (note: private playlists are not supported)
              </span>
            </p>
            <p>2. select the number of recommendations you wish to receive</p>
            <p>3. click generate</p>
            <p>4. get ai-powered movie recommendations!</p>
            <p>5. not happy with the results? click generate again!</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Paste Spotify link"
          className={`rounded-full px-4 py-2 w-1/2 ${
            isDarkMode ? "bg-white !text-black" : "bg-[#333333] !text-white"
          } placeholder-gray-400 focus:outline-none transition-all duration-300`}
        />
        <div className="flex items-center gap-2">
          <label
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            } font-montserrat text-sm transition-colors duration-300`}
          >
            # of recs
          </label>
          <select
            className={`rounded-full px-2 py-1 w-12 ${
              isDarkMode ? "bg-white !text-black" : "bg-[#333333] !text-white"
            } focus:outline-none font-montserrat text-sm text-center transition-all duration-300`}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1} selected={i + 1 === 5}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`${
            isDarkMode ? "bg-[#0ee65e] text-black" : "bg-[#1db954] text-white"
          } px-8 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-300`}
        >
          Generate
        </button>
      </div>
      <footer
        className={`absolute bottom-4 w-full text-center ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        } font-montserrat text-xs transition-colors duration-300`}
      >
        Made with {isDarkMode ? "🤍" : "🖤"} by Kailani
      </footer>
    </div>
  );
}

export default App;
