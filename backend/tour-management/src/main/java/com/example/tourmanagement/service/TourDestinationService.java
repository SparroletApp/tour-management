package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourDestinationDto;

public interface TourDestinationService extends CrudService<TourDestinationDto> {

    List<TourDestinationDto> findByTourPackage(Long tourPackageId);
}
