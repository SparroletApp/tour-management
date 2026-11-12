package com.example.tourmanagement.dto.tourdto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPriceRuleDto {

    private Long id;
    private Long tourPackageId;
    private String passengerCategory;
    private String roomCategory;
    private BigDecimal price;
    private String currency;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
