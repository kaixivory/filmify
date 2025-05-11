import express, { Request, Response, Router } from "express";
import axios from "axios";
import { MovieRecommendation } from "../services/openai";

const router: Router = express.Router();

// ... existing code ...

// Add new proxy endpoint for movie posters
router.get("/proxy/poster/:path(*)", async (req: Request, res: Response) => {
  try {
    const imagePath = req.params.path;
    // Remove any leading slashes and ensure proper path format
    const cleanPath = imagePath.replace(/^\/+/, "");
    const imageUrl = `https://image.tmdb.org/t/p/w500/${cleanPath}`;

    console.log("Proxying image request:", {
      originalPath: imagePath,
      cleanPath,
      fullUrl: imageUrl,
    });

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        Accept: "image/*",
        "User-Agent": "Mozilla/5.0",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all responses to handle errors properly
      },
    });

    if (response.status !== 200) {
      console.error("Error response from TMDB:", {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl,
      });
      return res.status(response.status).send("Error loading image from TMDB");
    }

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.setHeader("Content-Type", response.headers["content-type"]);

    console.log("Successfully proxied image:", {
      url: imageUrl,
      contentType: response.headers["content-type"],
      contentLength:
        response.data instanceof Buffer ? response.data.length : "unknown",
    });

    res.send(response.data);
  } catch (error) {
    console.error("Error proxying image:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      path: req.params.path,
    });
    res.status(500).send("Error loading image");
  }
});

export default router;
