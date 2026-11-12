package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourExclusionDto;

public interface TourExclusionService extends CrudService<TourExclusionDto> {

    List<TourExclusionDto> findByTourPackage(Long tourPackageId);
}
