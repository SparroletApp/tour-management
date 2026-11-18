package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.companydto.CompanyCreateDto;
import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.companydto.CompanyResponseDto;
import com.example.tourmanagement.service.CompanyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/create")
    public ResponseEntity<CompanyResponseDto> createCompany(
            @Valid @RequestBody CompanyCreateDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.createCompany(dto));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<CompanyResponseDto>> getAllCompanies() {

        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<CompanyResponseDto> getCompanyById(
            @Valid @RequestBody CompanyIdDto dto) {

        return ResponseEntity.ok(companyService.getCompanyById(dto));
    }

    @PostMapping("/update")
    public ResponseEntity<CompanyResponseDto> updateCompany(
            @Valid @RequestBody CompanyResponseDto dto) {

        return ResponseEntity.ok(companyService.updateCompany(dto));
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteCompany(
            @Valid @RequestBody CompanyIdDto dto) {

        companyService.deleteCompany(dto);

        return ResponseEntity.ok("Company deleted successfully");
    }

    @PostMapping("/count")
    public ResponseEntity<Long> getTotalCompanies() {
        return ResponseEntity.ok(companyService.getTotalCompanies());
    }
}