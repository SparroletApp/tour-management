
ALTER TABLE form_submissions
    ADD COLUMN coupon_code VARCHAR(255) NULL,
    ADD COLUMN discount_percentage DECIMAL(5,2) NULL;

CREATE INDEX idx_form_submissions_coupon_code
    ON form_submissions (coupon_code);

