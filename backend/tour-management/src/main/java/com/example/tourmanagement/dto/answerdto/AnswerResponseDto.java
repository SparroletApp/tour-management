package com.example.tourmanagement.dto.answerdto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponseDto {

    private Long id;

    private Long submissionId;

    private Long questionId;

    private String questionTitle;

    private String answer;
}