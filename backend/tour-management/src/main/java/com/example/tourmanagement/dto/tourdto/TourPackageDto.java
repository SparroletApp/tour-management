package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPackageDto {

    private Long id;
    private String tourCode;
    private String tourName;
    private String description;
    private Integer durationDays;
    private Integer durationNights;
    private Integer minimumTravellers;
    private Integer maximumTravellers;
    private String currency;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
