package com.example.tourmanagement.dto.answerdto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAnswerDto {

    private Long questionId;

    private String answer;
}