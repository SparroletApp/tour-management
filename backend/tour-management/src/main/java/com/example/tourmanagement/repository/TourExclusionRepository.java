package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourExclusion;

public interface TourExclusionRepository extends JpaRepository<TourExclusion, Long> {
    List<TourExclusion> findByTourPackageIdOrderBySequenceNumber(Long tourPackageId);
}
