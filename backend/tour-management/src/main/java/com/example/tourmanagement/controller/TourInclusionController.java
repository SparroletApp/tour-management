package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourInclusionDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourInclusionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-inclusions")
@RequiredArgsConstructor
public class TourInclusionController extends BaseCrudController<TourInclusionDto> {

    private final TourInclusionService service;

    @Override
    protected CrudService<TourInclusionDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourInclusionDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
