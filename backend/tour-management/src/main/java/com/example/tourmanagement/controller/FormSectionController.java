
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.sectiondto.*;
import com.example.tourmanagement.service.FormSectionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/form-sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FormSectionController {

    private final FormSectionService formSectionService;

    @PostMapping("/create")
    public ResponseEntity<SectionResponseDto> createSection(
            @RequestBody CreateSectionDto dto) {

        return ResponseEntity.ok(formSectionService.createSection(dto));
    }

    @PostMapping("/get-by-form")
    public ResponseEntity<List<SectionResponseDto>> getSectionsByForm(
            @RequestBody SectionIdDto dto) {

        return ResponseEntity.ok(
                formSectionService.getSectionsByForm(dto)
        );
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<SectionResponseDto> getSectionById(
            @RequestBody SectionIdDto dto) {

        return ResponseEntity.ok(
                formSectionService.getSectionById(dto)
        );
    }

    @PostMapping("/update")
    public ResponseEntity<SectionResponseDto> updateSection(
            @RequestBody UpdateSectionDto dto) {

        return ResponseEntity.ok(
                formSectionService.updateSection(dto)
        );
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteSection(
            @RequestBody SectionIdDto dto) {

        return ResponseEntity.ok(
                formSectionService.deleteSection(dto)
        );
    }
}
