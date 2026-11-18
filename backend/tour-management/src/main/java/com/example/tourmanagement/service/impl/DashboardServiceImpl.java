package com.example.tourmanagement.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.dashboarddto.DashboardResponseDto;
import com.example.tourmanagement.repository.DashboardRepository;
import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository dashboardRepository;
    private final FormsRepository formRepository;

    @Override
    public DashboardResponseDto getDashboardDetails(CompanyIdDto dto) {

        Long companyId = dto.getId();

        return DashboardResponseDto.builder()

                // Tour packages
                .totalTourPackages(
                        dashboardRepository.getTotalTourPackages(companyId)
                )
                .publishedTourPackages(
                        dashboardRepository.getPublishedTourPackages(companyId)
                )
                .draftTourPackages(
                        dashboardRepository.getDraftTourPackages(companyId)
                )
                .closedTourPackages(
                        dashboardRepository.getClosedTourPackages(companyId)
                )

                .totalForms(
                        formRepository.getTotalForms(companyId)
                )
                .publishedForms(
                        formRepository.getPublishedForms(companyId)
                )
                .draftForms(
                        formRepository.getDraftForms(companyId)
                )
                .closedForms(
                        formRepository.getClosedForms(companyId)
                )

                .build();
    }
}