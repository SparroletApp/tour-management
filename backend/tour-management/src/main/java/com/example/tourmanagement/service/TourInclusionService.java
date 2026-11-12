package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourInclusionDto;

public interface TourInclusionService extends CrudService<TourInclusionDto> {

    List<TourInclusionDto> findByTourPackage(Long tourPackageId);
}
