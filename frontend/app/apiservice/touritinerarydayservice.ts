import { TourItineraryDay } from "../types/tour";
import { childCrud } from "./crudservice";

export const tourItineraryDayService = childCrud<TourItineraryDay>("/api/tour-itinerary-days", "package");
