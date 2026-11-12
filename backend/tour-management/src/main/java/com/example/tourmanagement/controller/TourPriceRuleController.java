package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourPriceRuleDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourPriceRuleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-price-rules")
@RequiredArgsConstructor
public class TourPriceRuleController extends BaseCrudController<TourPriceRuleDto> {

    private final TourPriceRuleService service;

    @Override
    protected CrudService<TourPriceRuleDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourPriceRuleDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
