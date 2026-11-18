package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.dashboarddto.DashboardResponseDto;

public interface DashboardService {

    DashboardResponseDto getDashboardDetails(CompanyIdDto dto);
}