
package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmissionEntity, Long> {

    List<FormSubmissionEntity> findByFormId(Long formId);

    List<FormSubmissionEntity> findByFormIdOrderBySubmittedAtDesc(Long formId);

    List<FormSubmissionEntity> findByFormIdAndStatus(Long formId, String status);

    long countByFormId(Long formId);
}
