package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.answerdto.*;
import com.example.tourmanagement.entity.FormAnswerEntity;
import com.example.tourmanagement.entity.FormQuestionEntity;
import com.example.tourmanagement.entity.FormSubmissionEntity;
import com.example.tourmanagement.repository.FormAnswerRepository;
import com.example.tourmanagement.repository.FormQuestionRepository;
import com.example.tourmanagement.repository.FormSubmissionRepository;
import com.example.tourmanagement.service.FormAnswerService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FormAnswerServiceImpl implements FormAnswerService {

    private final FormAnswerRepository answerRepository;
    private final FormQuestionRepository questionRepository;
    private final FormSubmissionRepository submissionRepository;

    @Override
    public List<AnswerResponseDto> submitAnswers(SubmitAnswersDto dto) {

        FormSubmissionEntity submission = submissionRepository.findById(dto.getSubmissionId())
                .orElseThrow(() -> new RuntimeException(
                        "Submission not found with ID: " + dto.getSubmissionId()
                ));

        if (dto.getAnswers() == null || dto.getAnswers().isEmpty()) {
            throw new RuntimeException("Please provide at least one answer");
        }

        List<FormAnswerEntity> savedAnswers = dto.getAnswers().stream()
                .map(answerDto -> {

                    FormQuestionEntity question = questionRepository.findById(
                            answerDto.getQuestionId()
                    ).orElseThrow(() -> new RuntimeException(
                            "Question not found with ID: " + answerDto.getQuestionId()
                    ));

                    if (!question.getSection().getForm().getId()
                            .equals(submission.getForm().getId())) {
                        throw new RuntimeException(
                                "Question does not belong to this form"
                        );
                    }

                    return answerRepository.save(
                            FormAnswerEntity.builder()
                                    .submission(submission)
                                    .question(question)
                                    .answer(answerDto.getAnswer())
                                    .build()
                    );
                })
                .toList();

        return savedAnswers.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnswerResponseDto> getAnswersBySubmission(AnswerIdDto dto) {

        return answerRepository.findBySubmissionId(dto.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnswerResponseDto getAnswerById(AnswerIdDto dto) {

        FormAnswerEntity answer = getAnswer(dto.getId());

        return mapToResponse(answer);
    }

    @Override
    public String deleteAnswer(AnswerIdDto dto) {

        FormAnswerEntity answer = getAnswer(dto.getId());

        answerRepository.delete(answer);

        return "Answer deleted successfully";
    }

    private FormAnswerEntity getAnswer(Long id) {

        return answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Answer not found with ID: " + id
                ));
    }

    private AnswerResponseDto mapToResponse(FormAnswerEntity answer) {

        return AnswerResponseDto.builder()
                .id(answer.getId())
                .submissionId(answer.getSubmission().getId())
                .questionId(answer.getQuestion().getId())
                .questionTitle(answer.getQuestion().getQuestionTitle())
                .answer(answer.getAnswer())
                .build();
    }
}