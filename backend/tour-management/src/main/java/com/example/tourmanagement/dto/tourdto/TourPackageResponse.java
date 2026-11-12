package com.example.tourmanagement.dto.tourdto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for a complete tour: the package plus everything that belongs to it.
 * Uses DTOs (not entities). Each itinerary day carries its activities in TourItineraryDayDto.activities.
 * The JSON shape is the same as TourPackageFullDto, so the frontend types do not change.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPackageResponse {

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

    /** Builds a response from the full DTO that the service returns. */
    public static TourPackageResponse from(TourPackageFullDto full) {
        TourPackageResponse r = new TourPackageResponse();
        r.setTourPackage(full.getTourPackage());
        r.setDestinations(full.getDestinations());
        r.setFlights(full.getFlights());
        r.setHotels(full.getHotels());
        r.setItineraryDays(full.getItineraryDays());
        r.setInclusions(full.getInclusions());
        r.setExclusions(full.getExclusions());
        r.setOptionalActivities(full.getOptionalActivities());
        r.setPriceRules(full.getPriceRules());
        r.setMedia(full.getMedia());
        return r;
    }
}
