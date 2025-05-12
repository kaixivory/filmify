import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express, { Request, Response } from "express";
import { getPlaylistDetails } from "./services/spotify";
import {
  generateMovieRecommendations,
  getMatchingMovies,
} from "./services/openai";
import { getGenres } from "./services/tmdb";
import cors from "cors";
import movieRoutes from "./routes/movies";

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

// Configure CORS with specific origin
const allowedOrigins = [
  "https://filmify-ai.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: function (origin, callback) {
      // In development, allow all origins
      if (isDevelopment) {
        return callback(null, true);
      }

      // In production, check against allowed origins
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        console.log("Allowed origin:", origin);
        return callback(null, true);
      }

      console.log("Blocked origin:", origin);
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Add OPTIONS handling for preflight requests
app.options("*", cors());

app.use(express.json());

// Routes
app.use("/api/movies", movieRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend Server is Running");
});

app.post("/api/playlist", (req: Request, res: Response) => {
  const handleRequest = async () => {
    try {
      const {
        spotifyLink,
        numRecs = 5,
        selectedGenres = [],
        selectedAgeRatings = [],
        selectedRuntime = [],
        selectedRatings = [],
      } = req.body;

      console.log("Debug - API Received Preferences:", {
        selectedGenres,
        selectedAgeRatings,
        selectedRuntime,
        selectedRatings,
      });

      if (!spotifyLink) {
        return res.status(400).json({ error: "Spotify link is required" });
      }

      // Set up SSE for loading stages
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sendStage = (stage: number) => {
        res.write(`data: ${JSON.stringify({ stage })}\n\n`);
      };

      console.log("Processing playlist:", spotifyLink);
      const playlistDetails = await getPlaylistDetails(spotifyLink);
      console.log("✓ Playlist details fetched");

      // Stage 0: Finding movies
      sendStage(0);
      const matchingMovies = await getMatchingMovies(
        selectedGenres,
        selectedAgeRatings,
        selectedRuntime,
        selectedRatings
      );
      console.log(`Found ${matchingMovies.length} matching movies`);

      // Stage 1: Analyzing playlist
      sendStage(1);
      const movieRecommendations = await generateMovieRecommendations(
        playlistDetails,
        numRecs,
        selectedGenres,
        selectedAgeRatings,
        selectedRuntime,
        selectedRatings
      );
      console.log("✓ Movie recommendations generated");

      // Stage 2: Receiving recommendations
      sendStage(2);
      // Wait 3 seconds before showing results
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Send final response
      res.write(
        `data: ${JSON.stringify({
          playlist: playlistDetails,
          recommendations: movieRecommendations,
        })}\n\n`
      );
      res.end();
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      // Send error as SSE event
      res.write(
        `data: ${JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        })}\n\n`
      );
      res.end();
    }
  };

  handleRequest();
});

app.get("/api/genres", async (req: Request, res: Response) => {
  try {
    const genres = await getGenres();
    res.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
