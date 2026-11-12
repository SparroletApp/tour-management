package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourHotelDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourHotelService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-hotels")
@RequiredArgsConstructor
public class TourHotelController extends BaseCrudController<TourHotelDto> {

    private final TourHotelService service;

    @Override
    protected CrudService<TourHotelDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourHotelDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
