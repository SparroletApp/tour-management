package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.coupondto.*;
import com.example.tourmanagement.service.CouponService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/create")
    public ResponseEntity<CouponResponseDto> createCoupon(
            @Valid @RequestBody CouponCreateDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(dto));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<CouponResponseDto>> getAllCoupons() {

        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping("/get-by-company")
    public ResponseEntity<List<CouponResponseDto>> getCouponsByCompanyId(
            @RequestBody CouponCreateDto dto) {

        return ResponseEntity.ok(
                couponService.getCouponsByCompanyId(dto.getCompanyId())
        );
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<CouponResponseDto> getCouponById(
            @Valid @RequestBody CouponIdDto dto) {

        return ResponseEntity.ok(couponService.getCouponById(dto));
    }

    @PostMapping("/update")
    public ResponseEntity<CouponResponseDto> updateCoupon(
            @Valid @RequestBody CouponUpdateDto dto) {

        return ResponseEntity.ok(couponService.updateCoupon(dto));
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteCoupon(
            @Valid @RequestBody CouponIdDto dto) {

        couponService.deleteCoupon(dto);

        return ResponseEntity.ok("Coupon deleted successfully");
    }

    @PostMapping("/validate/tourcode")
    public ResponseEntity<Boolean> validateByTourCode(
            @Valid @RequestBody TourCodeCouponValidateDto dto) {

        return ResponseEntity.ok(
                couponService.validateByTourCode(
                        dto.getTourCode(),
                        dto.getCouponCode()
                )
        );
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationDto> validateCoupon(
            @Valid @RequestBody CouponValidateRequestDto dto) {

        return ResponseEntity.ok(
                couponService.validate(dto.getCouponCode(), dto.getFormId())
        );
    }

    @PostMapping("/get-by-package-id")
    public ResponseEntity<CouponResponseDto> getCouponByPackageId(
            @RequestBody PackageIdDto dto
    ) {
        return ResponseEntity.ok(
                couponService.getCouponByPackageId(dto.getPackageId())
        );
    }
}