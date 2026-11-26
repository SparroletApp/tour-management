ALTER TABLE tour_packages
    ADD COLUMN coupon_id BIGINT NULL;

ALTER TABLE tour_packages
    ADD CONSTRAINT fk_tour_package_coupon
        FOREIGN KEY (coupon_id)
            REFERENCES coupons(id);