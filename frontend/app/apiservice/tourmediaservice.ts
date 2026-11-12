import { TourMedia } from "../types/tour";
import { childCrud } from "./crudservice";

export const tourMediaService = childCrud<TourMedia>("/api/tour-medias", "package");
