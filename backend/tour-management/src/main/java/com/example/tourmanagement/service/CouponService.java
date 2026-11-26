package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.coupondto.*;

import java.util.List;

public interface CouponService {

    CouponResponseDto createCoupon(CouponCreateDto dto);

    List<CouponResponseDto> getAllCoupons();

    List<CouponResponseDto> getCouponsByCompanyId(Long companyId);

    CouponResponseDto getCouponById(CouponIdDto dto);

    CouponResponseDto updateCoupon(CouponUpdateDto dto);

    void deleteCoupon(CouponIdDto dto);

    // Existing form validation
    CouponValidationDto validate(String couponCode, Long formId);

    // New tour code validation
    boolean validateByTourCode(String tourCode, String couponCode);

    CouponResponseDto getCouponByPackageId(Long packageId);
}