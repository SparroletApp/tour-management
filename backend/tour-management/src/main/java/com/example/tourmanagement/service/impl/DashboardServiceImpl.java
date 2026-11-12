package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.repository.FormsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tourmanagement.dto.dashboarddto.DashboardResponseDto;
import com.example.tourmanagement.repository.DashboardRepository;
import com.example.tourmanagement.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository dashboardRepository;
    private final FormsRepository formRepository;

    @Override
    public DashboardResponseDto getDashboardDetails() {

        return DashboardResponseDto.builder()

                // Tour packages
                .totalTourPackages(
                        dashboardRepository.getTotalTourPackages()
                )
                .publishedTourPackages(
                        dashboardRepository.getPublishedTourPackages()
                )
                .draftTourPackages(
                        dashboardRepository.getDraftTourPackages()
                )
                .closedTourPackages(
                        dashboardRepository.getClosedTourPackages()
                )

                // Forms
                .totalForms(
                        formRepository.getTotalForms()
                )
                .publishedForms(
                        formRepository.getPublishedForms()
                )
                .draftForms(
                        formRepository.getDraftForms()
                )
                .closedForms(
                        formRepository.getClosedForms()
                )

                .build();
    }
}