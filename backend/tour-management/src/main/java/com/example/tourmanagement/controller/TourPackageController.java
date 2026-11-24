package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.tourdto.TourCompanyIdDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.tourmanagement.dto.tourdto.TourPackageDto;
import com.example.tourmanagement.dto.tourdto.TourPackageFullDto;
import com.example.tourmanagement.service.CrudService;
import com.example.tourmanagement.service.TourPackageService;

import lombok.RequiredArgsConstructor;

import java.util.List;

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

    @PostMapping("/get-unassigned-by-company")
    public ResponseEntity<List<TourPackageDto>> getUnassignedPackagesByCompanyId(
            @RequestBody TourCompanyIdDto request) {

        return ResponseEntity.ok(
                service.getUnassignedPackagesByCompanyId(request)
        );
    }

    @PostMapping("/get-by-company")
    public ResponseEntity<List<TourPackageDto>> getByCompanyId(
            @RequestBody TourCompanyIdDto request) {

        return ResponseEntity.ok(
                service.getByCompanyId(request)
        );
    }
}
