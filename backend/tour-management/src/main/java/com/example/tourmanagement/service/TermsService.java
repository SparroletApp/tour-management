
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.termsdto.TermsCreateDto;
import com.example.tourmanagement.dto.termsdto.TermsUpdateDto;
import com.example.tourmanagement.dto.termsdto.TermsResponseDto;

import java.util.List;

public interface TermsService {

    TermsResponseDto create(TermsCreateDto dto);

    List<TermsResponseDto> getAll();

    TermsResponseDto getById(Long id);

    TermsResponseDto update(TermsUpdateDto dto);
    List<TermsResponseDto> getByCompanyId(Long companyId);

    void delete(Long id);
}
