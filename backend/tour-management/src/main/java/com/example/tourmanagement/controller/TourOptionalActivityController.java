package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourOptionalActivityDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourOptionalActivityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-optional-activities")
@RequiredArgsConstructor
public class TourOptionalActivityController extends BaseCrudController<TourOptionalActivityDto> {

    private final TourOptionalActivityService service;

    @Override
    protected CrudService<TourOptionalActivityDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourOptionalActivityDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
