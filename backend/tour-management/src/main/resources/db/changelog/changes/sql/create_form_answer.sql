
CREATE TABLE IF NOT EXISTS form_answers (
                                            id BIGSERIAL PRIMARY KEY,

                                            submission_id BIGINT NOT NULL,

                                            question_id BIGINT NOT NULL,

                                            answer TEXT,

                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                            CONSTRAINT fk_form_answer_submission
                                            FOREIGN KEY (submission_id)
    REFERENCES form_submissions(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_form_answer_question
    FOREIGN KEY (question_id)
    REFERENCES form_questions(id)
    ON DELETE CASCADE
    );

-- Indexes for faster answer retrieval
CREATE INDEX IF NOT EXISTS idx_form_answers_submission_id
    ON form_answers(submission_id);

CREATE INDEX IF NOT EXISTS idx_form_answers_question_id
    ON form_answers(question_id);
