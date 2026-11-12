
CREATE TABLE IF NOT EXISTS form_sections (
    id BIGSERIAL PRIMARY KEY,

    form_id BIGINT NOT NULL,

    section_title VARCHAR(200) NOT NULL,

    section_description TEXT,

    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_section_form
    FOREIGN KEY (form_id)
    REFERENCES forms(id)
    ON DELETE CASCADE
    );

-- Index for retrieving sections by form
CREATE INDEX IF NOT EXISTS idx_form_sections_form_id
    ON form_sections(form_id);

-- Index for section ordering
CREATE INDEX IF NOT EXISTS idx_form_sections_display_order
    ON form_sections(display_order);
