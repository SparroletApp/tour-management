package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourMediaDto {

    private Long id;
    private Long tourPackageId;
    private String mediaType;
    private String fileName;
    private String fileUrl;
    private String caption;
    private Integer sequenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
