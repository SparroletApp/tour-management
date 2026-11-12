package com.example.tourmanagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.tourmanagement.dto.tourdto.TourPackageDto;
import com.example.tourmanagement.dto.tourdto.TourPackageFullDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourPackageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourPackageController extends BaseCrudController<TourPackageDto> {

    private final TourPackageService service;

    @Override
    protected CrudService<TourPackageDto> crudService() {
        return service;
    }

    @PostMapping("/full")
    @ResponseStatus(HttpStatus.CREATED)
    public TourPackageFullDto createFull(@RequestBody TourPackageFullDto request) {
        return service.createFull(request);
    }

    @GetMapping("/{id}/full")
    public TourPackageFullDto getFull(@PathVariable Long id) {
        return service.getFull(id);
    }

    @PutMapping("/{id}/full")
    public TourPackageFullDto updateFull(@PathVariable Long id, @RequestBody TourPackageFullDto request) {
        return service.updateFull(id, request);
    }
}
