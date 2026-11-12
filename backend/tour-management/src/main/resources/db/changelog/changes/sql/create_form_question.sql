
CREATE TABLE IF NOT EXISTS form_questions (
                                              id BIGSERIAL PRIMARY KEY,

                                              section_id BIGINT NOT NULL,

                                              question_title VARCHAR(500) NOT NULL,

    field_type VARCHAR(100) NOT NULL,

    required BOOLEAN NOT NULL DEFAULT FALSE,

    placeholder TEXT,

    help_text TEXT,

    options TEXT,

    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_question_section
    FOREIGN KEY (section_id)
    REFERENCES form_sections(id)
    ON DELETE CASCADE
    );

-- Index for retrieving questions by section
CREATE INDEX IF NOT EXISTS idx_form_questions_section_id
    ON form_questions(section_id);

-- Index for ordering questions
CREATE INDEX IF NOT EXISTS idx_form_questions_display_order
    ON form_questions(display_order);
