
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.formdto.CreateFormDto;
import com.example.tourmanagement.dto.formdto.UpdateFormDto;
import com.example.tourmanagement.dto.formdto.FormIdDto;
import com.example.tourmanagement.dto.formdto.FormSlugDto;
import com.example.tourmanagement.dto.formdto.FormResponseDto;
import com.example.tourmanagement.service.FormsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormsController {

    private final FormsService formsService;

    @PostMapping("/create")
    public ResponseEntity<FormResponseDto> createForm(
            @RequestBody CreateFormDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(formsService.createForm(dto));
    }

    @PostMapping("/get-all")
    public ResponseEntity<List<FormResponseDto>> getAllForms() {

        return ResponseEntity.ok(formsService.getAllForms());
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<FormResponseDto> getFormById(
            @RequestBody FormIdDto dto) {

        return ResponseEntity.ok(formsService.getFormById(dto));
    }

    @PostMapping("/get-by-slug")
    public ResponseEntity<FormResponseDto> getFormBySlug(
            @RequestBody FormSlugDto dto) {

        return ResponseEntity.ok(formsService.getFormBySlug(dto));
    }

    @PostMapping("/update")
    public ResponseEntity<FormResponseDto> updateForm(
            @RequestBody UpdateFormDto dto) {

        return ResponseEntity.ok(formsService.updateForm(dto));
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteForm(
            @RequestBody FormIdDto dto) {

        return ResponseEntity.ok(formsService.deleteForm(dto));
    }

    @PostMapping("/publish")
    public ResponseEntity<FormResponseDto> publishForm(
            @RequestBody FormIdDto dto) {

        return ResponseEntity.ok(formsService.publishForm(dto));
    }

    @PostMapping("/close")
    public ResponseEntity<FormResponseDto> closeForm(
            @RequestBody FormIdDto dto) {

        return ResponseEntity.ok(formsService.closeForm(dto));
    }
}
