ALTER TABLE forms
DROP CONSTRAINT IF EXISTS fk_forms_tour_package;

ALTER TABLE forms
DROP COLUMN IF EXISTS tour_package_id;
ALTER TABLE tour_packages
    ADD COLUMN IF NOT EXISTS form_id BIGINT;

ALTER TABLE tour_packages
    ADD CONSTRAINT fk_tour_packages_form
        FOREIGN KEY (form_id)
            REFERENCES forms(id)
            ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tour_packages_form_id
    ON tour_packages(form_id);
