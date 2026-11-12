import { TourInclusion } from "../types/tour";
import { childCrud } from "./crudservice";


export const tourInclusionService = childCrud<TourInclusion>("/api/tour-inclusions", "package");
