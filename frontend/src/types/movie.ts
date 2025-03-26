export interface MovieRecommendation {
  id: number;
  title: string;
  year: number;
  reason: string;
  posterUrl: string | null;
  rating: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number | null;
  ageRating: string | null;
}
