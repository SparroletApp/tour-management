package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.FormAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormAnswerRepository extends JpaRepository<FormAnswerEntity, Long> {

    List<FormAnswerEntity> findBySubmissionId(Long submissionId);

    List<FormAnswerEntity> findByQuestionId(Long questionId);

    boolean existsBySubmissionIdAndQuestionId(Long submissionId, Long questionId);
}