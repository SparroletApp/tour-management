
package com.example.tourmanagement.dto.coupondto;

import com.example.tourmanagement.enums.CouponStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CouponCreateDto {

    @NotBlank(message = "Coupon code is required")
    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    private String couponCode;

    @NotNull(message = "Percentage is required")
    @DecimalMin(value = "0.01", message = "Percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Percentage cannot exceed 100")
    private BigDecimal percentage;

    @FutureOrPresent(message = "Expiry date cannot be in the past")
    private LocalDate expiryDate;

    private CouponStatus status = CouponStatus.ACTIVE;

    @Positive(message = "Usage limit must be greater than 0")
    private Integer usageLimit;

    @NotNull(message = "Company ID is required")
    private Long companyId;
}
