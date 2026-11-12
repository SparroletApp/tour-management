package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourFlight;

public interface TourFlightRepository extends JpaRepository<TourFlight, Long> {
    List<TourFlight> findByTourPackageIdOrderByDepartureDateTime(Long tourPackageId);
}
