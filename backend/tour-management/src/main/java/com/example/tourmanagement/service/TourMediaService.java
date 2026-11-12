package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourMediaDto;

public interface TourMediaService extends CrudService<TourMediaDto> {

    List<TourMediaDto> findByTourPackage(Long tourPackageId);
}
