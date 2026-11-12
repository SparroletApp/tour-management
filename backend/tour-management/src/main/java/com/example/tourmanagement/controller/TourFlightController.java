package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourFlightDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourFlightService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-flights")
@RequiredArgsConstructor
public class TourFlightController extends BaseCrudController<TourFlightDto> {

    private final TourFlightService service;

    @Override
    protected CrudService<TourFlightDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourFlightDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
