package com.example.tourmanagement.dto.tourdto;

import java.time.LocalDate;
import java.util.List;

import com.example.tourmanagement.entity.*;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TourPackageRequest {

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
    private List<TourDestination> destinations;
    private List<TourFlight> flights;
    private List<TourHotel> hotels;
    private List<DayRequest> itineraryDays;
    private List<TourInclusion> inclusions;
    private List<TourExclusion> exclusions;
    private List<TourOptionalActivity> optionalActivities;
    private List<TourPriceRule> priceRules;
    private List<TourMedia> media;

    @Getter @Setter
    public static class DayRequest {
        private Integer dayNumber;
        private LocalDate tourDate;
        private String title;
        private String description;
        private String overnightCity;
        private String mealPlan;
        private List<TourItineraryActivity> activities;
    }
}