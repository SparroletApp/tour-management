package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourMedia;

public interface TourMediaRepository extends JpaRepository<TourMedia, Long> {
    List<TourMedia> findByTourPackageIdOrderBySequenceNumber(Long tourPackageId);
}
