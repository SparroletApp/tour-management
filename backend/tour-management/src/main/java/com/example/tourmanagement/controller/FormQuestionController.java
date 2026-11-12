package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.questiondto.*;
import com.example.tourmanagement.service.FormQuestionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class FormQuestionController {

    private final FormQuestionService questionService;

    @PostMapping("/create")
    public ResponseEntity<QuestionResponseDto> createQuestion(
            @RequestBody CreateQuestionDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.createQuestion(dto));
    }

    @PostMapping("/get-by-section")
    public ResponseEntity<List<QuestionResponseDto>> getQuestionsBySection(
            @RequestBody QuestionIdDto dto) {

        return ResponseEntity.ok(questionService.getQuestionsBySection(dto));
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<QuestionResponseDto> getQuestionById(
            @RequestBody QuestionIdDto dto) {

        return ResponseEntity.ok(questionService.getQuestionById(dto));
    }

    @PostMapping("/update")
    public ResponseEntity<QuestionResponseDto> updateQuestion(
            @RequestBody UpdateQuestionDto dto) {

        return ResponseEntity.ok(questionService.updateQuestion(dto));
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteQuestion(
            @RequestBody QuestionIdDto dto) {

        return ResponseEntity.ok(questionService.deleteQuestion(dto));
    }
}