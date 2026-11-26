
package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.entity.CouponEntity;
import com.example.tourmanagement.enums.CouponStatus;
import com.example.tourmanagement.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class CouponExpiryScheduler {

    private final CouponRepository couponRepository;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void deactivateExpiredCoupons() {

        LocalDate today = LocalDate.now();

        for (CouponEntity coupon : couponRepository.findAll()) {

            if (
                    coupon.getExpiryDate() != null &&
                            coupon.getExpiryDate().isBefore(today) &&
                            coupon.getStatus() == CouponStatus.ACTIVE
            ) {
                coupon.setStatus(CouponStatus.INACTIVE);
                couponRepository.save(coupon);
            }
        }
    }
}
