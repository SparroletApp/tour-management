package com.example.tourmanagement.dto.tourdto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The complete tour: package + everything that belongs to it.
 * Used both as the request body (create / update) and as the response.
 * Itinerary days carry their activities inside TourItineraryDayDto.activities.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPackageFullDto {

    private TourPackageDto tourPackage;
    private List<TourDestinationDto> destinations = new ArrayList<>();
    private List<TourFlightDto> flights = new ArrayList<>();
    private List<TourHotelDto> hotels = new ArrayList<>();
    private List<TourItineraryDayDto> itineraryDays = new ArrayList<>();
    private List<TourInclusionDto> inclusions = new ArrayList<>();
    private List<TourExclusionDto> exclusions = new ArrayList<>();
    private List<TourOptionalActivityDto> optionalActivities = new ArrayList<>();
    private List<TourPriceRuleDto> priceRules = new ArrayList<>();
    private List<TourMediaDto> media = new ArrayList<>();
}
