import axios from "axios";

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string };
  duration_ms: number;
}

export interface SpotifyPlaylist {
  name: string;
  tracks: SpotifyTrack[];
  total: number;
}

interface SpotifyTokenResponse {
  access_token: string;
}

interface SpotifyPlaylistResponse {
  name: string;
  tracks: {
    items: Array<{
      track: {
        name: string;
        artists: Array<{ name: string }>;
        album: { name: string };
        duration_ms: number;
      };
    }>;
    total: number;
  };
}

export async function getPlaylistDetails(
  spotifyLink: string
): Promise<SpotifyPlaylist> {
  try {
    // Extract playlist ID from the Spotify link
    const playlistId = extractPlaylistId(spotifyLink);
    if (!playlistId) {
      throw new Error("Invalid Spotify playlist link");
    }

    // Get access token
    const accessToken = await getSpotifyAccessToken();

    // Fetch playlist details
    const response = await axios.get<SpotifyPlaylistResponse>(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Extract relevant information
    const playlist = response.data;
    const tracks = playlist.tracks.items.map((item) => ({
      name: item.track.name,
      artists: item.track.artists.map((artist) => ({ name: artist.name })),
      album: { name: item.track.album.name },
      duration_ms: item.track.duration_ms,
    }));

    if (tracks.length === 0) {
      throw new Error("The playlist is empty");
    }

    return {
      name: playlist.name,
      tracks,
      total: playlist.tracks.total,
    };
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: any } };
      if (axiosError.response?.status === 404) {
        throw new Error(
          "Playlist not found. Please check if the link is correct and the playlist is public."
        );
      } else if (axiosError.response?.status === 401) {
        throw new Error(
          "Spotify authentication failed. Please try again in a few moments."
        );
      } else if (axiosError.response?.status === 403) {
        throw new Error(
          "This playlist is private. Please make it public or share a different playlist."
        );
      }
    }
    throw new Error(
      "Failed to fetch playlist details. Please try again in a few moments."
    );
  }
}

function extractPlaylistId(spotifyLink: string): string | null {
  const match = spotifyLink.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getSpotifyAccessToken(): Promise<string> {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials not configured");
    }

    const response = await axios.post<SpotifyTokenResponse>(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get Spotify access token");
  }
}
