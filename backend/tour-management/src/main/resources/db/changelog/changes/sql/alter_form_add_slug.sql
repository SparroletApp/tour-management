
ALTER TABLE forms
    ADD COLUMN slug VARCHAR(100);

UPDATE forms
SET slug = 'form-' || id
WHERE slug IS NULL;

ALTER TABLE forms
    ALTER COLUMN slug SET NOT NULL;

ALTER TABLE forms
    ADD CONSTRAINT uk_forms_slug UNIQUE (slug);
