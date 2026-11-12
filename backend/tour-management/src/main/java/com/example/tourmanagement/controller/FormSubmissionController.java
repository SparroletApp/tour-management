
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.submissiondto.*;
import com.example.tourmanagement.service.FormSubmissionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/form-submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;

    @PostMapping("/create")
    public ResponseEntity<SubmissionResponseDto> createSubmission(
            @RequestBody CreateSubmissionDto dto) {

        return ResponseEntity.ok(
                formSubmissionService.createSubmission(dto)
        );
    }

    @PostMapping("/get-by-form")
    public ResponseEntity<List<SubmissionResponseDto>> getSubmissionsByForm(
            @RequestBody SubmissionIdDto dto) {

        return ResponseEntity.ok(
                formSubmissionService.getSubmissionsByForm(dto)
        );
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<SubmissionResponseDto> getSubmissionById(
            @RequestBody SubmissionIdDto dto) {

        return ResponseEntity.ok(
                formSubmissionService.getSubmissionById(dto)
        );
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteSubmission(
            @RequestBody SubmissionIdDto dto) {

        return ResponseEntity.ok(
                formSubmissionService.deleteSubmission(dto)
        );
    }
}
