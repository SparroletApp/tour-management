package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.CouponEntity;
import com.example.tourmanagement.enums.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<CouponEntity, Long> {

    List<CouponEntity> findAllByCompany_Id(Long companyId);

    boolean existsByCompany_IdAndCouponCode(Long companyId, String couponCode);

    boolean existsByCompany_IdAndCouponCodeAndIdNot(
            Long companyId,
            String couponCode,
            Long id
    );

    @Modifying
    @Query("""
    update CouponEntity c
       set c.usedCount = c.usedCount + 1
     where c.id = :id
       and c.status = :active
       and (c.expiryDate is null or c.expiryDate >= :today)
       and (c.usageLimit is null or c.usedCount < c.usageLimit)
""")
    int redeem(@Param("id") Long id,
               @Param("active") CouponStatus active,
               @Param("today") LocalDate today);

    Optional<CouponEntity> findByCompany_IdAndCouponCodeIgnoreCase(Long companyId, String code);
    @Query("""
    SELECT tp.coupon
    FROM TourPackage tp
    WHERE tp.id = :packageId
    AND tp.coupon IS NOT NULL
""")
    Optional<CouponEntity> findCouponByPackageId(
            @Param("packageId") Long packageId
    );

}