package com.example.tourmanagement.dto.tourdto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourOptionalActivityDto {

    private Long id;
    private Long tourPackageId;
    private String activityName;
    private String description;
    private BigDecimal price;
    private String currency;
    private String availabilityType;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
