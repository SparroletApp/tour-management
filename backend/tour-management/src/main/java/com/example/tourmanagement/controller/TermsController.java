package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.termsdto.TermsCompanyIdDto;
import com.example.tourmanagement.dto.termsdto.TermsCreateDto;
import com.example.tourmanagement.dto.termsdto.TermsUpdateDto;
import com.example.tourmanagement.dto.termsdto.TermsResponseDto;
import com.example.tourmanagement.service.TermsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terms")
@RequiredArgsConstructor
public class TermsController {

    private final TermsService termsService;

    @PostMapping("/create")
    public ResponseEntity<TermsResponseDto> create(
            @Valid @RequestBody TermsCreateDto dto) {

        return ResponseEntity.ok(termsService.create(dto));
    }

    @PostMapping("/get-all")
    public ResponseEntity<List<TermsResponseDto>> getAll() {

        return ResponseEntity.ok(termsService.getAll());
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<TermsResponseDto> getById(
            @RequestBody Map<String, Long> request) {

        Long id = request.get("id");

        return ResponseEntity.ok(termsService.getById(id));
    }

    @PostMapping("/update")
    public ResponseEntity<TermsResponseDto> update(
            @Valid @RequestBody TermsUpdateDto dto) {

        return ResponseEntity.ok(termsService.update(dto));
    }

    @PostMapping("/delete")
    public ResponseEntity<Map<String, String>> delete(
            @RequestBody Map<String, Long> request) {

        Long id = request.get("id");

        termsService.delete(id);

        return ResponseEntity.ok(
                Map.of("message", "Terms and conditions deleted successfully")
        );
    }

    @PostMapping("/get-by-company-id")
    public ResponseEntity<List<TermsResponseDto>> getByCompanyId(
            @Valid @RequestBody TermsCompanyIdDto dto) {

        return ResponseEntity.ok(
                termsService.getByCompanyId(dto.getCompanyId())
        );
    }
}