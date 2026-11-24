package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormsRepository extends JpaRepository<FormEntity, Long> {

    Optional<FormEntity> findByPublicToken(String publicToken);

    boolean existsByPublicToken(String publicToken);
    List<FormEntity> findByCompanyIsNull();
    boolean existsByTourPackage_Id(Long packageId);
    List<FormEntity> findByCompany_Id(Long companyId);
    Optional<FormEntity> findFirstByTourPackage_TourCodeAndStatus(
            String tourCode,
            String status
    );
    boolean existsByFormTitle(String formTitle);

    boolean existsBySlug(String slug);

    Optional<FormEntity> findBySlug(String slug);

    // Total Forms
    @Query("""
        SELECT COUNT(f) FROM FormEntity f
        WHERE f.tourPackage.company.id = :companyId
    """)
    Long getTotalForms(@Param("companyId") Long companyId);

    // Published Forms
    @Query("""
        SELECT COUNT(f) FROM FormEntity f
        WHERE f.tourPackage.company.id = :companyId
        AND UPPER(f.status) = 'PUBLISHED'
    """)
    Long getPublishedForms(@Param("companyId") Long companyId);

    // Draft Forms
    @Query("""
        SELECT COUNT(f) FROM FormEntity f
        WHERE f.tourPackage.company.id = :companyId
        AND UPPER(f.status) = 'DRAFT'
    """)
    Long getDraftForms(@Param("companyId") Long companyId);

    // Closed Forms
    @Query("""
        SELECT COUNT(f) FROM FormEntity f
        WHERE f.tourPackage.company.id = :companyId
        AND UPPER(f.status) = 'CLOSED'
    """)
    Long getClosedForms(@Param("companyId") Long companyId);
}