package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.sectiondto.*;

import java.util.List;

public interface FormSectionService {

    SectionResponseDto createSection(CreateSectionDto dto);

    List<SectionResponseDto> getSectionsByForm(SectionIdDto dto);

    SectionResponseDto getSectionById(SectionIdDto dto);

    SectionResponseDto updateSection(UpdateSectionDto dto);

    String deleteSection(SectionIdDto dto);
}