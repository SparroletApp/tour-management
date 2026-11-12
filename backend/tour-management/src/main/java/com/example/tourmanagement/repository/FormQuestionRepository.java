package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormQuestionEntity;
import com.example.tourmanagement.entity.FormSectionEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormQuestionRepository extends JpaRepository<FormQuestionEntity, Long> {

    List<FormQuestionEntity> findBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    List<FormQuestionEntity> findBySection(FormSectionEntity section);

    boolean existsByQuestionTitleAndSectionId(String questionTitle, Long sectionId);
}