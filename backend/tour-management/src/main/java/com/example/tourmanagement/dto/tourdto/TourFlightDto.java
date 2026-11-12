package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourFlightDto {

    private Long id;
    private Long tourPackageId;
    private String flightType;
    private String airlineName;
    private String flightNumber;
    private String departureAirport;
    private String arrivalAirport;
    private LocalDateTime departureDateTime;
    private LocalDateTime arrivalDateTime;
    private String baggageAllowance;
    private String cabinBaggage;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
