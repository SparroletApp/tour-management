ALTER TABLE forms
    ADD COLUMN tour_package_id BIGINT;

ALTER TABLE forms
    ADD CONSTRAINT fk_forms_tour_package
        FOREIGN KEY (tour_package_id)
            REFERENCES tour_packages(id);