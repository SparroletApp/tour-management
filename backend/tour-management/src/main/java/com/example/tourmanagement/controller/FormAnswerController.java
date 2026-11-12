
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.answerdto.*;
import com.example.tourmanagement.service.FormAnswerService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class FormAnswerController {

    private final FormAnswerService answerService;

    @PostMapping("/submit")
    public ResponseEntity<List<AnswerResponseDto>> submitAnswers(
            @RequestBody SubmitAnswersDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(answerService.submitAnswers(dto));
    }

    @PostMapping("/get-by-submission")
    public ResponseEntity<List<AnswerResponseDto>> getAnswersBySubmission(
            @RequestBody AnswerIdDto dto) {

        return ResponseEntity.ok(
                answerService.getAnswersBySubmission(dto)
        );
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<AnswerResponseDto> getAnswerById(
            @RequestBody AnswerIdDto dto) {

        return ResponseEntity.ok(
                answerService.getAnswerById(dto)
        );
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteAnswer(
            @RequestBody AnswerIdDto dto) {

        return ResponseEntity.ok(
                answerService.deleteAnswer(dto)
        );
    }
}
