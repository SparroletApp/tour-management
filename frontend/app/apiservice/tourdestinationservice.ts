import { TourDestination } from "../types/tour";
import { childCrud } from "./crudservice";


export const tourDestinationService = childCrud<TourDestination>("/api/tour-destinations", "package");
