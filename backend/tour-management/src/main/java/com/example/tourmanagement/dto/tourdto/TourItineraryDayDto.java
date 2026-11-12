package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourItineraryDayDto {

    private Long id;
    private Long tourPackageId;
    private Integer dayNumber;
    private LocalDate tourDate;
    private String title;
    private String description;
    private String overnightCity;
    private String mealPlan;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Filled only in full-tour responses / requests. */
    private List<TourItineraryActivityDto> activities;
}
