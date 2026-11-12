package com.example.tourmanagement.dto.questiondto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateQuestionDto {

    private Long id;

    private String questionTitle;

    private String fieldType;

    private Boolean required;

    private String placeholder;

    private String helpText;

    private String options;

    private Integer displayOrder;
}