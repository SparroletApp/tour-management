package com.example.tourmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.tourmanagement.dto.dashboarddto.DashboardResponseDto;
import com.example.tourmanagement.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/get-details")
    public ResponseEntity<DashboardResponseDto> getDashboardDetails() {

        DashboardResponseDto response =
                dashboardService.getDashboardDetails();

        return ResponseEntity.ok(response);
    }
}