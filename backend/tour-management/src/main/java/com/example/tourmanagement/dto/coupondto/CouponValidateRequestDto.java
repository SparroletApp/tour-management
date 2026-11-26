package com.example.tourmanagement.dto.coupondto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateRequestDto {

    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    private String couponCode;

    @NotNull(message = "Form ID is required")
    private Long formId;
}