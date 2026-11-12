package com.example.tourmanagement.dto.answerdto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAnswersDto {

    private Long submissionId;

    private List<CreateAnswerDto> answers;
}