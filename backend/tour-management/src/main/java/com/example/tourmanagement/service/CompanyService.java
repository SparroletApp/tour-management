package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.companydto.CompanyCreateDto;
import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.companydto.CompanyResponseDto;

import java.util.List;

public interface CompanyService {

    CompanyResponseDto createCompany(CompanyCreateDto dto);

    List<CompanyResponseDto> getAllCompanies();

    CompanyResponseDto getCompanyById(CompanyIdDto dto);

    CompanyResponseDto updateCompany(CompanyResponseDto dto);

    void deleteCompany(CompanyIdDto dto);
    long getTotalCompanies();
}