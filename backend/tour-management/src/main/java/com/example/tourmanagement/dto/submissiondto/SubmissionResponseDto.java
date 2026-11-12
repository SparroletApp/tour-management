package com.example.tourmanagement.dto.submissiondto;

import lombok.*;

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

    private String respondentName;

    private String respondentEmail;

    private String respondentPhone;

    private String status;

    private LocalDateTime submittedAt;

    private LocalDateTime createdAt;
}