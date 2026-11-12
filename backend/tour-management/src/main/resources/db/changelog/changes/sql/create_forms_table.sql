
CREATE TABLE IF NOT EXISTS forms (
    id BIGSERIAL PRIMARY KEY,
    form_title VARCHAR(200) NOT NULL,
    form_description TEXT,
    public_token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    allow_multiple_submissions BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX idx_forms_status
    ON forms(status);

CREATE INDEX idx_forms_public_token
    ON forms(public_token);
