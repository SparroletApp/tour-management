import { TourExclusion } from "../types/tour";
import { childCrud } from "./crudservice";


export const tourExclusionService = childCrud<TourExclusion>("/api/tour-exclusions", "package");
