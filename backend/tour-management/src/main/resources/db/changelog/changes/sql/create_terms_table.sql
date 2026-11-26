CREATE TABLE terms_and_conditions (
                                      id BIGSERIAL PRIMARY KEY,
                                      company_id BIGINT NOT NULL,

                                      name VARCHAR(255) NOT NULL,
                                      description TEXT NOT NULL,

                                      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      updated_at TIMESTAMP WITHOUT TIME ZONE,


                                      CONSTRAINT fk_terms_company
                                          FOREIGN KEY (company_id)
                                              REFERENCES companies(id)
                                              ON DELETE CASCADE
);


CREATE INDEX idx_terms_company_id
    ON terms_and_conditions(company_id);