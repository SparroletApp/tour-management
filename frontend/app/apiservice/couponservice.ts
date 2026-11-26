
import api from "./apiservice";

export type CouponStatus = "ACTIVE" | "INACTIVE";

export interface Coupon {
    id: number;
    couponCode: string;
    percentage: number;
    expiryDate: string | null;
    status: CouponStatus;
    usageLimit: number | null;
    usedCount: number;
    companyId: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface CouponCreateDto {
    couponCode: string;
    percentage: number;
    expiryDate: string | null;
    status: CouponStatus;
    usageLimit: number | null;
    companyId: number;
}

export interface CouponUpdateDto {
    id: number;
    couponCode: string;
    percentage: number;
    expiryDate: string | null;
    status: CouponStatus;
    usageLimit: number | null;
    usedCount: number;
    companyId: number;
}

export interface CouponIdDto {
    id: number;
}

export interface PackageIdDto {
    packageId: number;
}

export interface CouponCompanyIdDto {
    companyId: number;
}

// Existing form-based validation request
export interface CouponValidateDto {
    couponCode: string;
    formId: number;
}

// New tour-code-based validation request
export interface TourCodeCouponValidateDto {
    tourCode: string;
    couponCode: string;
}

export interface CouponValidation {
    valid: boolean;
    couponCode?: string | null;
    percentage?: number | null;
    message?: string;
}

export const couponService = {

    create: (data: CouponCreateDto) =>
        api.post<Coupon>("/api/coupons/create", data),

    getAll: () =>
        api.get<Coupon[]>("/api/coupons/get-all"),

    getByCompany: (data: CouponCompanyIdDto) =>
        api.post<Coupon[]>("/api/coupons/get-by-company", data),

    getById: (data: CouponIdDto) =>
        api.post<Coupon>("/api/coupons/get-by-id", data),

    update: (data: CouponUpdateDto) =>
        api.post<Coupon>("/api/coupons/update", data),

    delete: (data: CouponIdDto) =>
        api.post<string>("/api/coupons/delete", data),

    getByPackageId: (data: PackageIdDto) =>
        api.post<Coupon>("/api/coupons/get-by-package-id", data),

    validate: (data: CouponValidateDto) =>
        api.post<CouponValidation>("/api/coupons/validate", data),

    validateByTourCode: (data: TourCodeCouponValidateDto) =>
        api.post<boolean>("/api/coupons/validate/tourcode", data),
};

export default couponService;
