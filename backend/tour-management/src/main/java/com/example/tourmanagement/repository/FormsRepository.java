
package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormsRepository extends JpaRepository<FormEntity, Long> {

    Optional<FormEntity> findByPublicToken(String publicToken);

    boolean existsByPublicToken(String publicToken);

    boolean existsByFormTitle(String formTitle);

    boolean existsBySlug(String slug);

    Optional<FormEntity> findBySlug(String slug);
    @Query("SELECT COUNT(f) FROM FormEntity f")
    Long getTotalForms();

    @Query("SELECT COUNT(f) FROM FormEntity f WHERE UPPER(f.status) = 'PUBLISHED'")
    Long getPublishedForms();

    @Query("SELECT COUNT(f) FROM FormEntity f WHERE UPPER(f.status) = 'DRAFT'")
    Long getDraftForms();

    @Query("SELECT COUNT(f) FROM FormEntity f WHERE UPPER(f.status) = 'CLOSED'")
    Long getClosedForms();
}
