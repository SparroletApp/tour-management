ALTER TABLE tour_packages
    ADD COLUMN company_id BIGINT;

ALTER TABLE tour_packages
    ADD CONSTRAINT fk_tour_packages_company
        FOREIGN KEY (company_id)
            REFERENCES companies(id);