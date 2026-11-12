package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourDestinationDto {

    private Long id;
    private Long tourPackageId;
    private String countryName;
    private String cityName;
    private String imageUrl;
    private String description;
    private Integer sequenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
