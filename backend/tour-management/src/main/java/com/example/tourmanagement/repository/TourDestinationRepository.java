package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourDestination;

public interface TourDestinationRepository extends JpaRepository<TourDestination, Long> {
    List<TourDestination> findByTourPackageIdOrderBySequenceNumber(Long tourPackageId);
}
