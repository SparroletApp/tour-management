import { TourFlight } from "../types/tour";
import { childCrud } from "./crudservice";


export const tourFlightService = childCrud<TourFlight>("/api/tour-flights", "package");
