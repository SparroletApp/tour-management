package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourItineraryDay;

public interface TourItineraryDayRepository extends JpaRepository<TourItineraryDay, Long> {
    List<TourItineraryDay> findByTourPackageIdOrderByDayNumber(Long tourPackageId);
}
