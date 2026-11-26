
package com.example.tourmanagement.entity;

import com.example.tourmanagement.enums.CouponStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "coupons",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_company_coupon_code",
                        columnNames = {"company_id", "coupon_code"}
                )
        }
)
@Getter
@Setter
public class CouponEntity extends BaseEntity {

    @Column(name = "coupon_code", nullable = false, length = 50)
    private String couponCode;

    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;
}
