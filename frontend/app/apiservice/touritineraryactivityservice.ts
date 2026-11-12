import { TourItineraryActivity } from "../types/tour";
import { childCrud } from "./crudservice";

export const tourItineraryActivityService = childCrud<TourItineraryActivity>("/api/tour-itinerary-activities", "day");
