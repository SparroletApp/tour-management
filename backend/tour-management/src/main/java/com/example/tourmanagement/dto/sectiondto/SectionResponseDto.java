package com.example.tourmanagement.dto.sectiondto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionResponseDto {

    private Long id;

    private Long formId;

    private String sectionTitle;

    private String sectionDescription;

    private Integer displayOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}