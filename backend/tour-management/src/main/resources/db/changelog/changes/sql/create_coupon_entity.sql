CREATE TABLE coupons (
                         id BIGSERIAL PRIMARY KEY,

                         coupon_code VARCHAR(50) NOT NULL,
                         percentage NUMERIC(5, 2) NOT NULL,

                         company_id BIGINT NOT NULL,

                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP,

                         CONSTRAINT fk_coupon_company
                             FOREIGN KEY (company_id)
                                 REFERENCES companies(id),

                         CONSTRAINT uk_company_coupon_code
                             UNIQUE (company_id, coupon_code),

                         CONSTRAINT chk_coupon_percentage
                             CHECK (percentage > 0 AND percentage <= 100)
);