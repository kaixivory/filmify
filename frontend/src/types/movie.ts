export interface MovieRecommendation {
  title: string;
  year: number;
  reason: string;
  posterUrl: string | null;
  rating: number;
  genres: string[];
}
