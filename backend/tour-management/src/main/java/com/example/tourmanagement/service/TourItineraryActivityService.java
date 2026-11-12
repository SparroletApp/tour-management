package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourItineraryActivityDto;

public interface TourItineraryActivityService extends CrudService<TourItineraryActivityDto> {

    List<TourItineraryActivityDto> findByItineraryDay(Long itineraryDayId);
}
