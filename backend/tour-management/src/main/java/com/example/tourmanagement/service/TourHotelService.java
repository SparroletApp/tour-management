package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourHotelDto;

public interface TourHotelService extends CrudService<TourHotelDto> {

    List<TourHotelDto> findByTourPackage(Long tourPackageId);
}
