package com.example.tourmanagement.dto.submissiondto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSubmissionDto {

    private Long formId;

    private String respondentName;

    private String respondentEmail;

    private String respondentPhone;
}