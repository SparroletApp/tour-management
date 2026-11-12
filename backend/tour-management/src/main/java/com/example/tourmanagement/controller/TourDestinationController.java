package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourDestinationDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourDestinationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-destinations")
@RequiredArgsConstructor
public class TourDestinationController extends BaseCrudController<TourDestinationDto> {

    private final TourDestinationService service;

    @Override
    protected CrudService<TourDestinationDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourDestinationDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
