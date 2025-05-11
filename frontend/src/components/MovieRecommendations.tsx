import React, { useRef, useState } from "react";
import { MovieRecommendation } from "../types/movie";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";

interface MovieRecommendationsProps {
  recommendations: MovieRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
}

// Share Preview Component
function SharePreview({
  movies,
  isDarkMode,
}: {
  movies: MovieRecommendation[];
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`w-[1080px] h-[1920px] ${
        isDarkMode ? "bg-[#0b1215]" : "bg-[#faf9f6]"
      } flex flex-col items-center justify-center p-12`}
    >
      <div className="grid grid-cols-2 gap-8 mb-12">
        {movies.slice(0, 4).map((movie, index) => (
          <div key={index} className="aspect-[2/3] relative w-[400px]">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="w-full h-full object-contain rounded-lg"
                crossOrigin="anonymous"
                loading="eager"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  isDarkMode ? "bg-[#0b1215]" : "bg-[#faf9f6]"
                } rounded-lg`}
              >
                <div className="text-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-12 h-12 mx-auto mb-2 ${
                      isDarkMode ? "text-[#faf9f6]/40" : "text-[#0b1215]/40"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <a
          href="https://filmify.ai"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 text-2xl ${
            isDarkMode
              ? "text-[#0ee65e] hover:text-[#0ee65e]/80"
              : "text-[#0baf47] hover:text-[#0baf47]/80"
          } transition-colors`}
        >
          <span>Get your own recommendations at filmify.ai</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
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
  );
}

export function MovieRecommendations({
  recommendations,
  isLoading,
  error,
  isDarkMode,
}: MovieRecommendationsProps) {
  const sharePreviewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleShare = async () => {
    if (!recommendations || recommendations.length === 0) return;

    // Show modal immediately
    setShowPreview(true);
    setIsGeneratingPreview(true);

    try {
      // Create a temporary container for the preview
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "1080px";
      container.style.height = "1920px";
      container.style.backgroundColor = isDarkMode ? "#0b1215" : "#faf9f6";
      document.body.appendChild(container);

      // Create a root and render the SharePreview component
      const root = createRoot(container);
      root.render(
        <SharePreview movies={recommendations} isDarkMode={isDarkMode} />
      );

      // Wait for images to load
      const loadImages = async () => {
        const images = container.getElementsByTagName("img");
        const imagePromises = Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = () => {
                  console.error("Failed to load image:", img.src);
                  resolve(null);
                };
              }
            })
        );
        await Promise.all(imagePromises);
      };

      // Wait for React to render and images to load
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await loadImages();

      // Create the preview
      const canvas = await html2canvas(container, {
        backgroundColor: isDarkMode ? "#0b1215" : "#faf9f6",
        scale: 2,
        width: 1080,
        height: 1920,
        useCORS: true,
        logging: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/png",
          1.0
        );
      });

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsGeneratingPreview(false);

      // Clean up
      root.unmount();
      document.body.removeChild(container);
    } catch (err) {
      console.error("Error generating share image:", err);
      setShowPreview(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleSave = () => {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "filmify-recommendations.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce"></div>
        </div>
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
      <div className="flex justify-center mt-8">
        <button
          onClick={handleShare}
          className={`${
            isDarkMode
              ? "bg-[#0ee65e] text-[#0b1215]"
              : "bg-[#0baf47] text-[#faf9f6]"
          } px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
          Share Recommendations
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            className={`${
              isDarkMode ? "bg-[#0b1215]" : "bg-[#faf9f6]"
            } rounded-xl p-6 animate-scaleIn max-w-[90vw]`}
          >
            <div
              className={`${
                isDarkMode ? "bg-black/30" : "bg-[#0b1215]/5"
              } w-[270px] h-[480px] rounded-lg border ${
                isDarkMode ? "border-white/10" : "border-black/10"
              } mb-4 overflow-hidden flex items-center justify-center`}
            >
              {isGeneratingPreview ? (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="text-center">
                    <p
                      className={`${
                        isDarkMode ? "text-[#faf9f6]" : "text-[#0b1215]"
                      } text-lg font-semibold`}
                    >
                      Generating Preview
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#0ee65e] animate-bounce"></div>
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrl || ""}
                  alt="Recommendations preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleClose}
                className={`${
                  isDarkMode
                    ? "bg-[#faf9f6]/20 text-[#faf9f6]"
                    : "bg-[#0b1215]/20 text-[#0b1215]"
                } px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-300`}
              >
                Cancel
              </button>
              {!isGeneratingPreview && previewUrl && (
                <button
                  onClick={handleSave}
                  className={`${
                    isDarkMode
                      ? "bg-[#0ee65e] text-[#0b1215]"
                      : "bg-[#0baf47] text-[#faf9f6]"
                  } px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Save Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
