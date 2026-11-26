package com.example.tourmanagement.dto.coupondto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TourCodeCouponValidateDto {

    @NotBlank(message = "Tour code is required")
    private String tourCode;

    @NotBlank(message = "Coupon code is required")
    private String couponCode;
}