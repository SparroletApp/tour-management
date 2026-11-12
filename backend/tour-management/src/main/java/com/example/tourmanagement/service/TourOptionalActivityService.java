package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourOptionalActivityDto;

public interface TourOptionalActivityService extends CrudService<TourOptionalActivityDto> {

    List<TourOptionalActivityDto> findByTourPackage(Long tourPackageId);
}
