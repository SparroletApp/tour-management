package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourOptionalActivity;

public interface TourOptionalActivityRepository extends JpaRepository<TourOptionalActivity, Long> {
    List<TourOptionalActivity> findByTourPackageId(Long tourPackageId);
}
