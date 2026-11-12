package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.answerdto.*;

import java.util.List;

public interface FormAnswerService {

    List<AnswerResponseDto> submitAnswers(SubmitAnswersDto dto);

    List<AnswerResponseDto> getAnswersBySubmission(AnswerIdDto dto);

    AnswerResponseDto getAnswerById(AnswerIdDto dto);

    String deleteAnswer(AnswerIdDto dto);
}