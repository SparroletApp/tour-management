package com.example.tourmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.tourmanagement.entity.TourPackage;

@Repository
public interface DashboardRepository extends JpaRepository<TourPackage, Long> {

    @Query("SELECT COUNT(t) FROM TourPackage t")
    Long getTotalTourPackages();

    @Query("SELECT COUNT(t) FROM TourPackage t WHERE UPPER(t.status) = 'PUBLISHED'")
    Long getPublishedTourPackages();

    @Query("SELECT COUNT(t) FROM TourPackage t WHERE UPPER(t.status) = 'DRAFT'")
    Long getDraftTourPackages();

    @Query("SELECT COUNT(t) FROM TourPackage t WHERE UPPER(t.status) = 'CLOSED'")
    Long getClosedTourPackages();
}