package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourInclusion;

public interface TourInclusionRepository extends JpaRepository<TourInclusion, Long> {
    List<TourInclusion> findByTourPackageIdOrderBySequenceNumber(Long tourPackageId);
}
