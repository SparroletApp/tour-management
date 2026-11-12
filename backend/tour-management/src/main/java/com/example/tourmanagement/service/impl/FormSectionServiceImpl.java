
package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.sectiondto.*;
import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.FormSectionEntity;
import com.example.tourmanagement.repository.FormSectionRepository;
import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.service.FormSectionService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FormSectionServiceImpl implements FormSectionService {

    private final FormSectionRepository sectionRepository;
    private final FormsRepository formsRepository;

    @Override
    public SectionResponseDto createSection(CreateSectionDto dto) {

        FormEntity form = formsRepository.findById(dto.getFormId())
                .orElseThrow(() ->
                        new RuntimeException("Form not found with ID: " + dto.getFormId()));

        FormSectionEntity section = new FormSectionEntity();

        section.setForm(form);
        section.setSectionTitle(dto.getSectionTitle());
        section.setSectionDescription(dto.getSectionDescription());
        section.setDisplayOrder(
                dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0
        );

        FormSectionEntity saved = sectionRepository.save(section);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponseDto> getSectionsByForm(SectionIdDto dto) {

        List<FormSectionEntity> sections =
                sectionRepository.findByFormIdOrderByDisplayOrderAsc(dto.getId());

        return sections.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SectionResponseDto getSectionById(SectionIdDto dto) {

        FormSectionEntity section = sectionRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Section not found with ID: " + dto.getId()));

        return mapToResponse(section);
    }

    @Override
    public SectionResponseDto updateSection(UpdateSectionDto dto) {

        FormSectionEntity section = sectionRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Section not found with ID: " + dto.getId()));

        if (dto.getSectionTitle() != null) {
            section.setSectionTitle(dto.getSectionTitle());
        }

        if (dto.getSectionDescription() != null) {
            section.setSectionDescription(dto.getSectionDescription());
        }

        if (dto.getDisplayOrder() != null) {
            section.setDisplayOrder(dto.getDisplayOrder());
        }

        FormSectionEntity updated = sectionRepository.save(section);

        return mapToResponse(updated);
    }

    @Override
    public String deleteSection(SectionIdDto dto) {

        FormSectionEntity section = sectionRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Section not found with ID: " + dto.getId()));

        sectionRepository.delete(section);

        return "Section deleted successfully";
    }

    private SectionResponseDto mapToResponse(FormSectionEntity section) {

        return SectionResponseDto.builder()
                .id(section.getId())
                .formId(section.getForm().getId())
                .sectionTitle(section.getSectionTitle())
                .sectionDescription(section.getSectionDescription())
                .displayOrder(section.getDisplayOrder())
                .createdAt(section.getCreatedAt())
                .updatedAt(section.getUpdatedAt())
                .build();
    }
}
