package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourExclusionDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourExclusionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-exclusions")
@RequiredArgsConstructor
public class TourExclusionController extends BaseCrudController<TourExclusionDto> {

    private final TourExclusionService service;

    @Override
    protected CrudService<TourExclusionDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourExclusionDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
