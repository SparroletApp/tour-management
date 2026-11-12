package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourFlightDto;

public interface TourFlightService extends CrudService<TourFlightDto> {

    List<TourFlightDto> findByTourPackage(Long tourPackageId);
}
