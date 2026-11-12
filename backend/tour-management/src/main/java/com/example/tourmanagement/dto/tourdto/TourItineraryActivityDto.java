package com.example.tourmanagement.dto.tourdto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourItineraryActivityDto {

    private Long id;
    private Long itineraryDayId;
    private String activityName;
    private String description;
    private String activityType;
    private Boolean included;
    private Boolean optional;
    private Integer sequenceNumber;
    private BigDecimal additionalPrice;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
