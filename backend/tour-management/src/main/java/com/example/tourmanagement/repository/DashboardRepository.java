package com.example.tourmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.tourmanagement.entity.TourPackage;

@Repository
public interface DashboardRepository extends JpaRepository<TourPackage, Long> {

    @Query("SELECT COUNT(t) FROM TourPackage t WHERE t.company.id = :companyId")
    Long getTotalTourPackages(@Param("companyId") Long companyId);

    @Query("""
        SELECT COUNT(t) FROM TourPackage t
        WHERE t.company.id = :companyId
        AND UPPER(t.status) = 'PUBLISHED'
    """)
    Long getPublishedTourPackages(@Param("companyId") Long companyId);

    @Query("""
        SELECT COUNT(t) FROM TourPackage t
        WHERE t.company.id = :companyId
        AND UPPER(t.status) = 'DRAFT'
    """)
    Long getDraftTourPackages(@Param("companyId") Long companyId);

    @Query("""
        SELECT COUNT(t) FROM TourPackage t
        WHERE t.company.id = :companyId
        AND UPPER(t.status) = 'CLOSED'
    """)
    Long getClosedTourPackages(@Param("companyId") Long companyId);
}