
package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourHotelDto {

    private Long id;
    private Long tourPackageId;
    private String cityName;
    private String hotelName;
    private String hotelCategory;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfNights;
    private String address;
    private String contactNumber;
    private String remarks;

    private String[] images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
