package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.tourdto.TourPackageDto;
import com.example.tourmanagement.dto.tourdto.TourPackageFullDto;

public interface TourPackageService extends CrudService<TourPackageDto> {

    /** Creates the package and all its children (days, activities, flights, ...) in one transaction. */
    TourPackageFullDto createFull(TourPackageFullDto request);

    /** Returns the package with every child, activities nested inside each day. */
    TourPackageFullDto getFull(Long id);

    /** Updates the package fields and replaces ALL children with the ones in the request. */
    TourPackageFullDto updateFull(Long id, TourPackageFullDto request);
}
