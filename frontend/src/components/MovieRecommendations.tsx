import React, { useRef, useState } from "react";
import { MovieRecommendation } from "../types/movie";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";

interface MovieRecommendationsProps {
  recommendations: MovieRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  playlistName: string;
}

// Update the helper function
const getProxiedImageUrl = (tmdbPath: string | null) => {
  if (!tmdbPath) {
    console.log("No TMDB path provided");
    return null;
  }
  console.log("Original TMDB path:", tmdbPath);

  // Extract the path part from the TMDB URL
  const path = tmdbPath.split("/w500/").pop();
  if (!path) {
    console.log("Failed to extract path from:", tmdbPath);
    return null;
  }

  // Use the backend URL from environment variable, fallback to localhost:5000
  const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const proxiedUrl = `${backendUrl}/api/movies/proxy/poster/${path}`;
  console.log("Generated proxied URL:", proxiedUrl);
  return proxiedUrl;
};

// Share Preview Component
function SharePreview({
  movies,
  isDarkMode,
  playlistName,
}: {
  movies: MovieRecommendation[];
  isDarkMode: boolean;
  playlistName: string;
}) {
  return (
    <div
      style={{
        width: "1080px",
        height: "1920px",
        backgroundColor: isDarkMode ? "#0b1215" : "#faf9f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          color: isDarkMode ? "#0ee65e" : "#0baf47",
          fontFamily: "Poppins, sans-serif",
          fontSize: "42px",
          fontWeight: "800",
          marginBottom: "32px",
          textAlign: "center",
          maxWidth: "1000px",
        }}
      >
        Your Perfect {movies.length === 1 ? "Movie" : "Movies"} for "
        {playlistName}"
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          maxWidth: "1000px",
          marginBottom: "32px",
        }}
      >
        {movies.map((movie, index) => (
          <div key={index} style={{ aspectRatio: "2/3", width: "320px" }}>
            {movie.posterUrl ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  backgroundColor: isDarkMode ? "#0b1215" : "#faf9f6",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={getProxiedImageUrl(movie.posterUrl) || ""}
                  alt={`${movie.title} poster`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error(`Failed to load image for ${movie.title}:`, {
                      originalUrl: movie.posterUrl,
                      proxiedUrl: getProxiedImageUrl(movie.posterUrl),
                      error: e,
                      apiUrl: process.env.REACT_APP_API_URL,
                    });
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image for ${movie.title}`);
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDarkMode ? "#0b1215" : "#faf9f6",
                  borderRadius: "8px",
                }}
              >
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 8px",
                      color: isDarkMode
                        ? "rgba(250, 249, 246, 0.4)"
                        : "rgba(11, 18, 21, 0.4)",
                    }}
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
      <div
        style={{
          textAlign: "center",
          marginTop: "auto",
          paddingBottom: "32px",
        }}
      >
        <a
          href="https://filmify-ai.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "28px",
            color: isDarkMode ? "#0ee65e" : "#0baf47",
            textDecoration: "none",
          }}
        >
          <span>Get your own recommendations at filmify-ai.onrender.com</span>
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
  playlistName,
}: MovieRecommendationsProps) {
  const sharePreviewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleShare = async () => {
    if (!recommendations || recommendations.length === 0) return;

    setShowPreview(true);
    setIsGeneratingPreview(true);

    try {
      // Create a temporary container for the share preview
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      document.body.appendChild(container);

      // Create a root for the SharePreview component
      const root = createRoot(container);
      root.render(
        <SharePreview
          movies={recommendations}
          isDarkMode={isDarkMode}
          playlistName={playlistName}
        />
      );

      // Wait for initial render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Load all images with proper CORS handling
      const imagePromises = recommendations
        .filter((movie) => movie.posterUrl)
        .map(
          (movie) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";

              // Set up error handling
              img.onerror = (error) => {
                console.error(
                  `Failed to load image for ${movie.title}:`,
                  error
                );
                // Create a fallback image with movie title
                const canvas = document.createElement("canvas");
                canvas.width = 320;
                canvas.height = 480;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = isDarkMode ? "#0b1215" : "#faf9f6";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.fillStyle = isDarkMode ? "#faf9f6" : "#0b1215";
                  ctx.font = "20px Arial";
                  ctx.textAlign = "center";
                  ctx.fillText(
                    movie.title,
                    canvas.width / 2,
                    canvas.height / 2
                  );
                }
                resolve(canvas);
              };

              // Set up success handling
              img.onload = () => {
                // Create a canvas to draw the image
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                }
                resolve(canvas);
              };

              // Set the source after setting up handlers
              img.src = movie.posterUrl!;
            })
        );

      // Wait for all images to load or fail
      const loadedImages = await Promise.allSettled(imagePromises);

      // Additional wait to ensure everything is rendered
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use html2canvas with CORS-aware options
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDarkMode ? "#0b1215" : "#faf9f6",
        logging: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = Array.from(clonedDoc.getElementsByTagName("img"));
          images.forEach((img) => {
            if (img) {
              img.crossOrigin = "anonymous";
              img.style.display = "block";
              img.style.width = "100%";
              img.style.height = "100%";
              img.style.objectFit = "contain";
            }
          });
        },
      });

      // Clean up the temporary container
      root.unmount();
      document.body.removeChild(container);

      // Convert to blob with high quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/png",
          1.0
        );
      });

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsGeneratingPreview(false);

      // Try to use Web Share API if available
      if (navigator.share) {
        try {
          const file = new File([blob], "filmify-recommendations.png", {
            type: "image/png",
          });

          await navigator.share({
            files: [file],
            title: "Filmify Recommendations",
            text: `Check out these movie recommendations for "${playlistName}"!`,
            url: "https://filmify-ai.onrender.com",
          });

          handleClose();
          return;
        } catch (shareError) {
          console.log(
            "Web Share API failed, falling back to download:",
            shareError
          );
          // Continue to fallback options
        }
      }
    } catch (err) {
      console.error("Error generating share image:", err);
      setShowPreview(false);
      setIsGeneratingPreview(false);
      alert("Failed to generate share image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!previewUrl) return;

    try {
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);

      if (isMobile && navigator.share) {
        try {
          const response = await fetch(previewUrl);
          const blob = await response.blob();
          const file = new File([blob], "filmify-recommendations.png", {
            type: "image/png",
          });

          await navigator.share({
            files: [file],
            title: "Filmify Recommendations",
            text: `Check out these movie recommendations for "${playlistName}"!`,
            url: "https://filmify-ai.onrender.com",
          });

          handleClose();
          return;
        } catch (shareError) {
          console.error("Error sharing:", shareError);
          // Fall back to download
        }
      }

      // Handle different mobile browsers
      if (isMobile) {
        if (isAndroid) {
          // For Android, try to download directly
          const link = document.createElement("a");
          link.href = previewUrl;
          link.download = "filmify-recommendations.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // For iOS, open in new tab
          window.open(previewUrl, "_blank");
        }
      } else {
        // Regular download for desktop
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = "filmify-recommendations.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      handleClose();
    } catch (err) {
      console.error("Error saving image:", err);
      alert("Failed to save image. Please try again.");
    }
  };

  const handleClose = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
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
                  src={getProxiedImageUrl(movie.posterUrl) || ""}
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
              } w-[300px] h-[500px] rounded-lg border ${
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
