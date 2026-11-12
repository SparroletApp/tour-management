package com.example.tourmanagement.dto.sectiondto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSectionDto {

    private Long id;

    private String sectionTitle;

    private String sectionDescription;

    private Integer displayOrder;
}