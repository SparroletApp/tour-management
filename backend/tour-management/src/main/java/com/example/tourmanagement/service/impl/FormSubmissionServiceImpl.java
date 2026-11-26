package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.submissiondto.*;
import com.example.tourmanagement.entity.CouponEntity;
import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.FormSubmissionEntity;
import com.example.tourmanagement.entity.TourPackage;
import com.example.tourmanagement.enums.CouponStatus;
import com.example.tourmanagement.repository.CouponRepository;
import com.example.tourmanagement.repository.FormSubmissionRepository;
import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.FormSubmissionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FormSubmissionServiceImpl implements FormSubmissionService {

    private final FormSubmissionRepository submissionRepository;
    private final FormsRepository formsRepository;
    private final CouponRepository couponRepository;
    private final TourPackageRepository tourPackageRepository;
    private final TourPackageRepository packageRepository;
    @Override
    public SubmissionResponseDto createSubmission(CreateSubmissionDto dto) {

        FormEntity form = formsRepository.findById(dto.getFormId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Form not found with ID: " + dto.getFormId()
                ));

        if (!"PUBLISHED".equalsIgnoreCase(form.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This form is not available for submissions"
            );
        }

        if (form.getExpiryDate() != null &&
                form.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This form has expired"
            );
        }

        if (!Boolean.TRUE.equals(form.getAllowMultipleSubmissions()) &&
                submissionRepository.countByFormId(form.getId()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This form does not allow multiple submissions"
            );
        }

        if (dto.getTourCode() == null || dto.getTourCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tour code is required"
            );
        }

        TourPackage tourPackage = tourPackageRepository
                .findByTourCodeIgnoreCase(dto.getTourCode().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tour package not found for tour code: " + dto.getTourCode()
                ));

        boolean packageBelongsToForm = form.getTourPackages() != null &&
                form.getTourPackages().stream()
                        .anyMatch(p -> p.getId().equals(tourPackage.getId()));

        if (!packageBelongsToForm) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This tour package is not associated with the submitted form"
            );
        }

        FormSubmissionEntity submission = new FormSubmissionEntity();

        submission.setForm(form);
        submission.setTourPackage(tourPackage);
        submission.setRespondentName(dto.getRespondentName());
        submission.setRespondentEmail(dto.getRespondentEmail());
        submission.setRespondentPhone(dto.getRespondentPhone());
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(LocalDateTime.now());
        CouponEntity coupon = resolveCoupon(tourPackage, dto.getCouponCode());

        if (coupon != null) {

            int updated = couponRepository.redeem(
                    coupon.getId(),
                    CouponStatus.ACTIVE,
                    LocalDate.now()
            );

            if (updated == 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Coupon is expired or no longer available"
                );
            }

            submission.setCouponCode(coupon.getCouponCode());
            submission.setDiscountPercentage(coupon.getPercentage());

            couponRepository.findById(coupon.getId()).ifPresent(c -> {
                if (c.getUsageLimit() != null &&
                        c.getUsedCount() >= c.getUsageLimit()) {
                    c.setStatus(CouponStatus.INACTIVE);
                }
            });
        }

        FormSubmissionEntity saved = submissionRepository.save(submission);

        return mapToResponse(saved);
    }

    @Override
    public List<SubmissionResponseDto> getSubmissionsByForm(SubmissionIdDto dto) {

        FormEntity form = formsRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Form not found with ID: " + dto.getId()
                ));

        return submissionRepository.findByFormId(form.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SubmissionResponseDto getSubmissionById(SubmissionIdDto dto) {

        FormSubmissionEntity submission = submissionRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Submission not found with ID: " + dto.getId()
                ));

        return mapToResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponseDto> getSubmissionsByPackage(
            PackageSubmissionIdDto dto
    ) {

        if (dto.getPackageId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Package ID is required"
            );
        }

        if (!packageRepository.existsById(dto.getPackageId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Tour package not found with ID: " + dto.getPackageId()
            );
        }

        List<FormSubmissionEntity> submissions =
                submissionRepository
                        .findByTourPackage_IdOrderByCreatedAtDesc(
                                dto.getPackageId()
                        );

        return submissions.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public String deleteSubmission(SubmissionIdDto dto) {

        FormSubmissionEntity submission = submissionRepository.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Submission not found with ID: " + dto.getId()
                ));

        submissionRepository.delete(submission);

        return "Submission deleted successfully";
    }

    private CouponEntity resolveCoupon(TourPackage tour, String codeFromLink) {

        // No coupon code provided by frontend = no coupon applied
        if (codeFromLink == null || codeFromLink.isBlank()) {
            return null;
        }

        // Only find the explicitly provided coupon
        return couponRepository
                .findByCompany_IdAndCouponCodeIgnoreCase(
                        tour.getCompany().getId(),
                        codeFromLink.trim()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid coupon code"
                ));
    }

    private SubmissionResponseDto mapToResponse(FormSubmissionEntity submission) {

        return SubmissionResponseDto.builder()
                .id(submission.getId())
                .formId(submission.getForm().getId())
                .formTitle(submission.getForm().getFormTitle())

                // Return package ID
                .packageId(
                        submission.getTourPackage() != null
                                ? submission.getTourPackage().getId()
                                : null
                )

                .respondentName(submission.getRespondentName())
                .respondentEmail(submission.getRespondentEmail())
                .respondentPhone(submission.getRespondentPhone())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .createdAt(submission.getCreatedAt())
                .couponCode(submission.getCouponCode())
                .discountPercentage(submission.getDiscountPercentage())
                .build();
    }
}