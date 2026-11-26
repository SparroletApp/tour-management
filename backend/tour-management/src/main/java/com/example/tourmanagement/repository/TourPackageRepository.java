
package com.example.tourmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.tourmanagement.entity.TourPackage;

public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {

    Optional<TourPackage> findByTourCode(String tourCode);

    List<TourPackage> findByCompany_Id(Long companyId);

    Optional<TourPackage> findByTourCodeIgnoreCase(String tourCode);

    @Query(value = """
        SELECT nextval(
            pg_get_serial_sequence('tour_packages', 'id')
        )
        """, nativeQuery = true)
    Long getNextTourPackageId();

    // Get packages that are not assigned to any form
    @Query("""
        SELECT p
        FROM TourPackage p
        WHERE p.company.id = :companyId
        AND NOT EXISTS (
            SELECT f.id
            FROM FormEntity f
            JOIN f.tourPackages tp
            WHERE tp.id = p.id
        )
        ORDER BY p.id DESC
    """)
    List<TourPackage> findUnassignedPackagesByCompanyId(
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
        FROM TourPackage t
        JOIN t.coupon c
        WHERE t.tourCode = :tourCode
        AND c.couponCode = :couponCode
        AND c.status = 'ACTIVE'
        AND (c.expiryDate IS NULL OR c.expiryDate >= CURRENT_DATE)
        AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
    """)
    boolean existsValidCouponForTour(
            @Param("tourCode") String tourCode,
            @Param("couponCode") String couponCode
    );

    @Query("""
    SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
    FROM TourPackage t
    JOIN t.coupon c
    WHERE t.tourCode = :tourCode
    AND UPPER(c.couponCode) = UPPER(:couponCode)
    AND c.status = com.example.tourmanagement.enums.CouponStatus.ACTIVE
    AND (c.expiryDate IS NULL OR c.expiryDate >= CURRENT_DATE)
    AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
""")
    boolean existsValidCouponForTourCode(
            @Param("tourCode") String tourCode,
            @Param("couponCode") String couponCode
    );

}
