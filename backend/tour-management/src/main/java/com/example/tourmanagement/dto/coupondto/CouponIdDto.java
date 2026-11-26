package com.example.tourmanagement.dto.coupondto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CouponIdDto {

    @NotNull(message = "Coupon ID is required")
    private Long id;
}