import { StudentReview } from "../../lib/types";

export interface FlatReview extends StudentReview {
  tutorName: string;
  tutorDistrict: string;
}
