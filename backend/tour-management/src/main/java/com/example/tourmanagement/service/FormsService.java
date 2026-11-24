
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.formdto.*;
import com.example.tourmanagement.dto.tourdto.TourCodeRequestDto;

import java.util.List;

public interface FormsService {

    FormResponseDto createForm(CreateFormDto dto);

    List<FormResponseDto> getAllForms();
    List<FormResponseDto> getFormsByCompany(FormCompanyIdDto dto);
    FormResponseDto getFormById(FormIdDto dto);
    FormResponseDto getPublishedByTourCode(TourCodeRequestDto dto);

    FormResponseDto updateForm(UpdateFormDto dto);
    List<FormResponseDto> getPublicForms();
    String deleteForm(FormIdDto dto);

    FormResponseDto publishForm(FormIdDto dto);

    FormResponseDto getFormBySlug(FormSlugDto dto);

    FormResponseDto closeForm(FormIdDto dto);
}
