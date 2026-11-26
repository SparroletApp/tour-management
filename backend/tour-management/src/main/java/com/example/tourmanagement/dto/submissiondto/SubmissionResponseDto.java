package com.example.tourmanagement.dto.submissiondto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponseDto {

    private Long id;

    private Long formId;

    private String formTitle;
    private Long packageId;
    private String respondentName;
    private String couponCode;

    private BigDecimal discountPercentage;
    private String respondentEmail;

    private String respondentPhone;

    private String status;

    private LocalDateTime submittedAt;

    private LocalDateTime createdAt;
}