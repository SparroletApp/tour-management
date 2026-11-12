
CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,

    form_id BIGINT NOT NULL,

    respondent_name VARCHAR(200),

    respondent_email VARCHAR(200),

    respondent_phone VARCHAR(20),

    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_submission_form
    FOREIGN KEY (form_id)
    REFERENCES forms(id)
    ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id
    ON form_submissions(form_id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_status
    ON form_submissions(status);

CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at
    ON form_submissions(submitted_at);
