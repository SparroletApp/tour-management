package com.example.tourmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourPackage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {
    Optional<TourPackage> findByTourCode(String tourCode);
    List<TourPackage> findByCompany_Id(Long companyId);

    @Query(value = """
        SELECT nextval(
            pg_get_serial_sequence('tour_packages', 'id')
        )
        """, nativeQuery = true)
    Long getNextTourPackageId();

    @Query("""
    SELECT p
    FROM TourPackage p
    WHERE p.company.id = :companyId
      AND NOT EXISTS (
          SELECT f.id
          FROM FormEntity f
          WHERE f.tourPackage.id = p.id
      )
    ORDER BY p.id DESC
""")
    List<TourPackage> findUnassignedPackagesByCompanyId(
            @Param("companyId") Long companyId
    );
}
