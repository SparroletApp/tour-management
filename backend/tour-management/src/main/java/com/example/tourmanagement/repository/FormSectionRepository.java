
package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormSectionRepository extends JpaRepository<FormSectionEntity, Long> {

    List<FormSectionEntity> findByFormId(Long formId);

    List<FormSectionEntity> findByFormIdOrderByDisplayOrderAsc(Long formId);

    boolean existsBySectionTitleAndFormId(String sectionTitle, Long formId);
}
