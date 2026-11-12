package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.questiondto.*;
import com.example.tourmanagement.entity.FormQuestionEntity;
import com.example.tourmanagement.entity.FormSectionEntity;
import com.example.tourmanagement.repository.FormQuestionRepository;
import com.example.tourmanagement.repository.FormSectionRepository;
import com.example.tourmanagement.service.FormQuestionService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FormQuestionServiceImpl implements FormQuestionService {

    private final FormQuestionRepository questionRepository;
    private final FormSectionRepository sectionRepository;

    @Override
    public QuestionResponseDto createQuestion(CreateQuestionDto dto) {

        FormSectionEntity section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException(
                        "Section not found with ID: " + dto.getSectionId()
                ));

        FormQuestionEntity question = FormQuestionEntity.builder()
                .section(section)
                .questionTitle(dto.getQuestionTitle())
                .fieldType(dto.getFieldType())
                .required(dto.getRequired() != null ? dto.getRequired() : false)
                .placeholder(dto.getPlaceholder())
                .helpText(dto.getHelpText())
                .options(dto.getOptions())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();

        return mapToResponse(questionRepository.save(question));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestionsBySection(QuestionIdDto dto) {

        return questionRepository
                .findBySectionIdOrderByDisplayOrderAsc(dto.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponseDto getQuestionById(QuestionIdDto dto) {

        FormQuestionEntity question = getQuestion(dto.getId());

        return mapToResponse(question);
    }

    @Override
    public QuestionResponseDto updateQuestion(UpdateQuestionDto dto) {

        FormQuestionEntity question = getQuestion(dto.getId());

        question.setQuestionTitle(dto.getQuestionTitle());
        question.setFieldType(dto.getFieldType());
        question.setRequired(dto.getRequired() != null ? dto.getRequired() : false);
        question.setPlaceholder(dto.getPlaceholder());
        question.setHelpText(dto.getHelpText());
        question.setOptions(dto.getOptions());
        question.setDisplayOrder(dto.getDisplayOrder());

        return mapToResponse(questionRepository.save(question));
    }

    @Override
    public String deleteQuestion(QuestionIdDto dto) {

        FormQuestionEntity question = getQuestion(dto.getId());

        questionRepository.delete(question);

        return "Question deleted successfully";
    }

    private FormQuestionEntity getQuestion(Long id) {

        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Question not found with ID: " + id
                ));
    }

    private QuestionResponseDto mapToResponse(FormQuestionEntity question) {

        return QuestionResponseDto.builder()
                .id(question.getId())
                .sectionId(question.getSection().getId())
                .questionTitle(question.getQuestionTitle())
                .fieldType(question.getFieldType())
                .required(question.getRequired())
                .placeholder(question.getPlaceholder())
                .helpText(question.getHelpText())
                .options(question.getOptions())
                .displayOrder(question.getDisplayOrder())
                .build();
    }
}