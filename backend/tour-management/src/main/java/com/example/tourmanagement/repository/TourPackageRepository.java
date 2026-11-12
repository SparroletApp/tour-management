package com.example.tourmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourPackage;
import org.springframework.data.jpa.repository.Query;

public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {
    Optional<TourPackage> findByTourCode(String tourCode);

    @Query(value = """
        SELECT nextval(
            pg_get_serial_sequence('tour_packages', 'id')
        )
        """, nativeQuery = true)
    Long getNextTourPackageId();
}
