
package com.example.tourmanagement.dto.coupondto;

import com.example.tourmanagement.enums.CouponStatus;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CouponResponseDto {

    private Long id;

    private String couponCode;

    private BigDecimal percentage;

    private LocalDate expiryDate;

    private CouponStatus status;

    private Integer usageLimit;

    private Integer usedCount;

    private Long companyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
