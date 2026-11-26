ALTER TABLE form_submissions
    ADD COLUMN package_id BIGINT;

ALTER TABLE form_submissions
    ADD CONSTRAINT fk_form_submissions_tour_package
        FOREIGN KEY (package_id)
            REFERENCES tour_packages(id);