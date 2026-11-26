package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.termsdto.TermsCreateDto;
import com.example.tourmanagement.dto.termsdto.TermsUpdateDto;
import com.example.tourmanagement.dto.termsdto.TermsResponseDto;

import com.example.tourmanagement.entity.TermsEntity;
import com.example.tourmanagement.entity.CompanyEntity;

import com.example.tourmanagement.repository.TermsRepository;
import com.example.tourmanagement.repository.CompanyRepository;

import com.example.tourmanagement.service.TermsService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TermsServiceImpl implements TermsService {

    private final TermsRepository termsRepository;
    private final CompanyRepository companyRepository;

    @Override
    public TermsResponseDto create(TermsCreateDto dto) {

        CompanyEntity company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException(
                        "Company not found with ID: " + dto.getCompanyId()
                ));

        TermsEntity entity = new TermsEntity();

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCompany(company);

        return convertToResponse(termsRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TermsResponseDto> getByCompanyId(Long companyId) {

        if (!companyRepository.existsById(companyId)) {
            throw new RuntimeException(
                    "Company not found with ID: " + companyId
            );
        }

        return termsRepository.findByCompany_Id(companyId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TermsResponseDto> getAll() {

        return termsRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TermsResponseDto getById(Long id) {

        TermsEntity entity = termsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Terms and conditions not found with ID: " + id
                ));

        return convertToResponse(entity);
    }

    @Override
    public TermsResponseDto update(TermsUpdateDto dto) {

        TermsEntity entity = termsRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Terms and conditions not found with ID: " + dto.getId()
                ));

        CompanyEntity company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException(
                        "Company not found with ID: " + dto.getCompanyId()
                ));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCompany(company);

        return convertToResponse(termsRepository.save(entity));
    }

    @Override
    public void delete(Long id) {

        TermsEntity entity = termsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Terms and conditions not found with ID: " + id
                ));

        termsRepository.delete(entity);
    }

    private TermsResponseDto convertToResponse(TermsEntity entity) {

        return TermsResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompany().getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}