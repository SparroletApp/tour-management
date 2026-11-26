package com.example.tourmanagement.dto.coupondto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationDto {

    private boolean valid;
    private String couponCode;
    private BigDecimal percentage;
    private String message;

    public static CouponValidationDto none() {
        return new CouponValidationDto(false, null, null, "No coupon for this tour");
    }
}