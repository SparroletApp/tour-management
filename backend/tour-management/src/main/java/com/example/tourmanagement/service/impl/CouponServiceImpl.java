package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.coupondto.*;
import com.example.tourmanagement.entity.CompanyEntity;
import com.example.tourmanagement.entity.CouponEntity;
import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.TourPackage;
import com.example.tourmanagement.enums.CouponStatus;
import com.example.tourmanagement.repository.CompanyRepository;
import com.example.tourmanagement.repository.CouponRepository;
import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.CouponService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CompanyRepository companyRepository;
    private final FormsRepository formsRepository;
    private final TourPackageRepository tourPackageRepository;
    // CREATE COUPON
    @Override
    public CouponResponseDto createCoupon(CouponCreateDto dto) {

        Long companyId = dto.getCompanyId();

        String couponCode = dto.getCouponCode()
                .trim()
                .toUpperCase();

        if (couponRepository.existsByCompany_IdAndCouponCode(
                companyId, couponCode)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Coupon code already exists for this company"
            );
        }

        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company not found"
                ));

        CouponEntity coupon = new CouponEntity();

        coupon.setCouponCode(couponCode);
        coupon.setPercentage(dto.getPercentage());
        coupon.setExpiryDate(dto.getExpiryDate());

        coupon.setStatus(
                dto.getStatus() != null
                        ? dto.getStatus()
                        : CouponStatus.ACTIVE
        );

        coupon.setUsageLimit(dto.getUsageLimit());

        // New coupon always starts with zero usage
        coupon.setUsedCount(0);

        coupon.setCompany(company);

        // Automatically deactivate if already expired
        updateExpiryStatus(coupon);

        CouponEntity savedCoupon = couponRepository.save(coupon);

        return mapToResponse(savedCoupon);
    }

    // GET ALL COUPONS
    @Override
    public List<CouponResponseDto> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .map(coupon -> {
                    updateExpiryStatus(coupon);
                    return mapToResponse(coupon);
                })
                .collect(Collectors.toList());
    }

    // GET COUPONS BY COMPANY ID
    @Override
    public List<CouponResponseDto> getCouponsByCompanyId(Long companyId) {

        if (!companyRepository.existsById(companyId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Company not found"
            );
        }

        return couponRepository.findAllByCompany_Id(companyId)
                .stream()
                .map(coupon -> {
                    updateExpiryStatus(coupon);
                    return mapToResponse(coupon);
                })
                .collect(Collectors.toList());
    }

    // GET COUPON BY ID
    @Override
    public CouponResponseDto getCouponById(CouponIdDto dto) {

        CouponEntity coupon = couponRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coupon not found"
                ));

        updateExpiryStatus(coupon);

        return mapToResponse(coupon);
    }

    // UPDATE COUPON
    @Override
    public CouponResponseDto updateCoupon(CouponUpdateDto dto) {

        CouponEntity coupon = couponRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coupon not found"
                ));

        Long companyId = dto.getCompanyId();

        String couponCode = dto.getCouponCode()
                .trim()
                .toUpperCase();

        if (couponRepository.existsByCompany_IdAndCouponCodeAndIdNot(
                companyId, couponCode, dto.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Coupon code already exists for this company"
            );
        }

        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company not found"
                ));

        // Validate used count
        if (dto.getUsedCount() == null || dto.getUsedCount() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Used count cannot be negative or empty"
            );
        }

        // Validate usage limit against updated used count
        if (dto.getUsageLimit() != null &&
                dto.getUsageLimit() < dto.getUsedCount()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Usage limit cannot be less than the used count"
            );
        }

        coupon.setCouponCode(couponCode);
        coupon.setPercentage(dto.getPercentage());
        coupon.setExpiryDate(dto.getExpiryDate());

        coupon.setUsageLimit(dto.getUsageLimit());

        coupon.setUsedCount(dto.getUsedCount());

        if (dto.getStatus() != null) {
            coupon.setStatus(dto.getStatus());
        }

        coupon.setCompany(company);

        // Expired coupons must remain inactive
        updateExpiryStatus(coupon);

        CouponEntity updatedCoupon = couponRepository.save(coupon);

        return mapToResponse(updatedCoupon);
    }

    private void updateExpiryStatus(CouponEntity coupon) {

        if (coupon.getExpiryDate() != null &&
                coupon.getExpiryDate().isBefore(LocalDate.now())) {

            coupon.setStatus(CouponStatus.INACTIVE);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponseDto getCouponByPackageId(Long packageId) {

        TourPackage tourPackage = tourPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tour package not found"
                ));

        CouponEntity coupon = tourPackage.getCoupon();

        if (coupon == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No coupon assigned to this tour package"
            );
        }

        return mapToResponse(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponValidationDto validate(String code, Long formId) {

        FormEntity form = formsRepository.findById(formId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Form not found"));

        TourPackage tour = form.getTourPackages()
                .stream()
                .findFirst()
                .orElse(null);
        CouponEntity c = (tour != null) ? tour.getCoupon() : null;

        if (c == null) {
            return CouponValidationDto.none();
        }

        boolean entered = code != null && !code.isBlank();
        if (entered && !c.getCouponCode().equalsIgnoreCase(code.trim())) {
            return new CouponValidationDto(false, code.trim(), null,
                    "Invalid coupon code for this tour");
        }

        boolean valid = c.getStatus() == CouponStatus.ACTIVE
                && (c.getExpiryDate() == null || !c.getExpiryDate().isBefore(LocalDate.now()))
                && (c.getUsageLimit() == null || c.getUsedCount() < c.getUsageLimit());

        return new CouponValidationDto(valid, c.getCouponCode(), c.getPercentage(),
                valid ? "Coupon applied" : "Coupon expired or fully used");
    }


    @Override
    @Transactional(readOnly = true)
    public boolean validateByTourCode(String tourCode, String couponCode) {

        if (tourCode == null || tourCode.isBlank()
                || couponCode == null || couponCode.isBlank()) {
            return false;
        }

        return tourPackageRepository.existsValidCouponForTourCode(
                tourCode.trim(),
                couponCode.trim().toUpperCase()
        );
    }

    @Override
    public void deleteCoupon(CouponIdDto dto) {

        CouponEntity coupon = couponRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coupon not found"
                ));

        couponRepository.delete(coupon);
    }

    private CouponResponseDto mapToResponse(CouponEntity coupon) {

        CouponResponseDto response = new CouponResponseDto();

        response.setId(coupon.getId());
        response.setCouponCode(coupon.getCouponCode());
        response.setPercentage(coupon.getPercentage());

        response.setExpiryDate(coupon.getExpiryDate());
        response.setStatus(coupon.getStatus());

        response.setUsageLimit(coupon.getUsageLimit());
        response.setUsedCount(coupon.getUsedCount());

        response.setCompanyId(coupon.getCompany().getId());

        response.setCreatedAt(coupon.getCreatedAt());
        response.setUpdatedAt(coupon.getUpdatedAt());

        return response;
    }
}