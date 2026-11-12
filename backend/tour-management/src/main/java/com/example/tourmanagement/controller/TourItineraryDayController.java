package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourItineraryDayDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourItineraryDayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-itinerary-days")
@RequiredArgsConstructor
public class TourItineraryDayController extends BaseCrudController<TourItineraryDayDto> {

    private final TourItineraryDayService service;

    @Override
    protected CrudService<TourItineraryDayDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourItineraryDayDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
