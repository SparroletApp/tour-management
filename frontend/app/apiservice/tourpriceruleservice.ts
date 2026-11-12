import { TourPriceRule } from "../types/tour";
import { childCrud } from "./crudservice";


export const tourPriceRuleService = childCrud<TourPriceRule>("/api/tour-price-rules", "package");
