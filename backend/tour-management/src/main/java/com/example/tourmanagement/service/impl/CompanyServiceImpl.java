package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.companydto.CompanyCreateDto;
import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.companydto.CompanyResponseDto;
import com.example.tourmanagement.entity.CompanyEntity;
import com.example.tourmanagement.repository.CompanyRepository;
import com.example.tourmanagement.service.CompanyService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Override
    public CompanyResponseDto createCompany(CompanyCreateDto dto) {

        if (companyRepository.existsByCompanyName(dto.getCompanyName().trim())) {
            throw new RuntimeException("Company name already exists");
        }

        CompanyEntity company = new CompanyEntity();
        company.setCompanyName(dto.getCompanyName().trim());

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponseDto> getAllCompanies() {

        return companyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(CompanyIdDto dto) {

        CompanyEntity company = companyRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return mapToResponse(company);
    }

    @Override
    public CompanyResponseDto updateCompany(CompanyResponseDto dto) {

        CompanyEntity company = companyRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String companyName = dto.getCompanyName().trim();

        if (companyRepository.existsByCompanyNameAndIdNot(companyName, dto.getId())) {
            throw new RuntimeException("Company name already exists");
        }

        company.setCompanyName(companyName);

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalCompanies() {
        return companyRepository.count();
    }

    @Override
    public void deleteCompany(CompanyIdDto dto) {

        CompanyEntity company = companyRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        companyRepository.delete(company);
    }

    private CompanyResponseDto mapToResponse(CompanyEntity company) {

        CompanyResponseDto response = new CompanyResponseDto();

        response.setId(company.getId());
        response.setCompanyName(company.getCompanyName());
        response.setCreatedAt(company.getCreatedAt());
        response.setUpdatedAt(company.getUpdatedAt());

        return response;
    }
}