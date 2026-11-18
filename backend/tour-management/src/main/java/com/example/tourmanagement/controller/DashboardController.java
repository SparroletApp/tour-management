package com.example.tourmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.dashboarddto.DashboardResponseDto;
import com.example.tourmanagement.service.DashboardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @PostMapping("/get-details")
    public ResponseEntity<DashboardResponseDto> getDashboardDetails(
            @Valid @RequestBody CompanyIdDto dto) {

        DashboardResponseDto response =
                dashboardService.getDashboardDetails(dto);

        return ResponseEntity.ok(response);
    }
}