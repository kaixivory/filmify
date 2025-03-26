import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express, { Request, Response } from "express";
import { getPlaylistDetails } from "./services/spotify";
import { generateMovieRecommendations } from "./services/openai";
import cors from "cors";

// Debug logging
console.log("Environment check:", {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Present" : "Missing",
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? "Present" : "Missing",
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
    ? "Present"
    : "Missing",
  TMDB_API_KEY: process.env.TMDB_API_KEY ? "Present" : "Missing",
});

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add OPTIONS handling for preflight requests
app.options("*", cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend Server is Running");
});

app.post("/api/playlist", (req: Request, res: Response) => {
  const handleRequest = async () => {
    try {
      const { spotifyLink, numRecs = 5 } = req.body;

      if (!spotifyLink) {
        return res.status(400).json({ error: "Spotify link is required" });
      }

      console.log("Processing playlist:", spotifyLink);
      const playlistDetails = await getPlaylistDetails(spotifyLink);
      console.log("✓ Playlist details fetched");

      const movieRecommendations = await generateMovieRecommendations(
        playlistDetails,
        numRecs
      );
      console.log("✓ Movie recommendations generated");

      res.json({
        playlist: playlistDetails,
        recommendations: movieRecommendations,
      });
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  };

  handleRequest();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
