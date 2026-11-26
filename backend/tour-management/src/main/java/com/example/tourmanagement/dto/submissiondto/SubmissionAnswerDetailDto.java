package com.example.tourmanagement.dto.submissiondto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionAnswerDetailDto {

    private Long answerId;
    private Long questionId;

    private String questionTitle;
    private String fieldType;
    private Boolean required;
    private String placeholder;
    private String helpText;
    private String options;

    private String answer;
}