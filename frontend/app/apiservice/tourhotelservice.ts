import { TourHotel } from "../types/tour";
import { childCrud } from "./crudservice";

export const tourHotelService = childCrud<TourHotel>("/api/tour-hotels", "package");
