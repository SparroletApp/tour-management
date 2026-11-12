package com.example.tourmanagement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tourmanagement.dto.tourdto.TourMediaDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourMediaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour-medias")
@RequiredArgsConstructor
public class TourMediaController extends BaseCrudController<TourMediaDto> {

    private final TourMediaService service;

    @Override
    protected CrudService<TourMediaDto> crudService() {
        return service;
    }

    @GetMapping("/package/{tourPackageId}")
    public List<TourMediaDto> byPackage(@PathVariable Long tourPackageId) {
        return service.findByTourPackage(tourPackageId);
    }
}
