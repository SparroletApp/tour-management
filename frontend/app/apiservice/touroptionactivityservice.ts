import { TourOptionalActivity } from "../types/tour";
import { childCrud } from "./crudservice";

export const tourOptionalActivityService = childCrud<TourOptionalActivity>("/api/tour-optional-activities", "package");
