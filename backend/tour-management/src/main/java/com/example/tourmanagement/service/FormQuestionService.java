package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.questiondto.*;

import java.util.List;

public interface FormQuestionService {

    QuestionResponseDto createQuestion(CreateQuestionDto dto);

    List<QuestionResponseDto> getQuestionsBySection(QuestionIdDto dto);

    QuestionResponseDto getQuestionById(QuestionIdDto dto);

    QuestionResponseDto updateQuestion(UpdateQuestionDto dto);

    String deleteQuestion(QuestionIdDto dto);
}