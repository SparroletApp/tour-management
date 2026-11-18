
ALTER TABLE forms
    ADD COLUMN company_id BIGINT;

ALTER TABLE forms
    ADD CONSTRAINT fk_forms_company
        FOREIGN KEY (company_id)
            REFERENCES companies(id);