package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourItineraryDayDto;

public interface TourItineraryDayService extends CrudService<TourItineraryDayDto> {

    List<TourItineraryDayDto> findByTourPackage(Long tourPackageId);
}
