
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.formdto.*;

import java.util.List;

public interface FormsService {

    FormResponseDto createForm(CreateFormDto dto);

    List<FormResponseDto> getAllForms();

    FormResponseDto getFormById(FormIdDto dto);

    FormResponseDto updateForm(UpdateFormDto dto);

    String deleteForm(FormIdDto dto);

    FormResponseDto publishForm(FormIdDto dto);

    FormResponseDto getFormBySlug(FormSlugDto dto);

    FormResponseDto closeForm(FormIdDto dto);
}
