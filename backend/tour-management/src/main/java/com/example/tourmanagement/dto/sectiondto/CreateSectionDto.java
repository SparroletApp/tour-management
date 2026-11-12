package com.example.tourmanagement.dto.sectiondto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSectionDto {

    private Long formId;

    private String sectionTitle;

    private String sectionDescription;

    private Integer displayOrder;
}