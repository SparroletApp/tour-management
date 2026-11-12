
package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormsRepository extends JpaRepository<FormEntity, Long> {

    Optional<FormEntity> findByPublicToken(String publicToken);

    boolean existsByPublicToken(String publicToken);

    boolean existsByFormTitle(String formTitle);

    boolean existsBySlug(String slug);

    Optional<FormEntity> findBySlug(String slug);
}
