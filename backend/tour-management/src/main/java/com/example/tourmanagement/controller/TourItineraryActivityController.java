package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourItineraryActivityDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourItineraryActivityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-itinerary-activities")
@RequiredArgsConstructor
public class TourItineraryActivityController extends BaseCrudController<TourItineraryActivityDto> {

    private final TourItineraryActivityService service;

    @Override
    protected CrudService<TourItineraryActivityDto> crudService() {
        return service;
    }

    @GetMapping("/day/{itineraryDayId}")
    public List<TourItineraryActivityDto> byDay(@PathVariable Long itineraryDayId) {
        return service.findByItineraryDay(itineraryDayId);
    }
}
