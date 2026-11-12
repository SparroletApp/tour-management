
package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.formdto.CreateFormDto;
import com.example.tourmanagement.dto.formdto.UpdateFormDto;
import com.example.tourmanagement.dto.formdto.FormIdDto;
import com.example.tourmanagement.dto.formdto.FormSlugDto;
import com.example.tourmanagement.dto.formdto.FormResponseDto;

import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.TourPackage;

import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.repository.TourPackageRepository;

import com.example.tourmanagement.service.FormsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FormsServiceImpl implements FormsService {

    private final FormsRepository formRepository;
    private final TourPackageRepository packageRepository;

    @Override
    public FormResponseDto createForm(CreateFormDto dto) {

        if (dto.getPackageId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tour package is required"
            );
        }

        TourPackage tourPackage = packageRepository
                .findById(dto.getPackageId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tour package not found with ID: " + dto.getPackageId()
                ));

        String slug = generateUniqueSlug(dto.getFormTitle());

        FormEntity form = FormEntity.builder()
                .formTitle(dto.getFormTitle())
                .formDescription(dto.getFormDescription())
                .slug(slug)
                .publicToken(UUID.randomUUID().toString())
                .status("DRAFT")
                .allowMultipleSubmissions(
                        dto.getAllowMultipleSubmissions() != null
                                ? dto.getAllowMultipleSubmissions()
                                : true
                )
                .expiryDate(dto.getExpiryDate())
                .tourPackage(tourPackage)
                .build();

        FormEntity savedForm = formRepository.save(form);

        return mapToResponse(savedForm);
    }

    private String generateUniqueSlug(String title) {

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Form title is required"
            );
        }

        String baseSlug = Normalizer.normalize(
                        title.trim(),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isBlank()) {
            baseSlug = "form";
        }

        baseSlug = baseSlug.substring(
                0,
                Math.min(baseSlug.length(), 100)
        );

        String slug = baseSlug;
        int count = 2;

        while (formRepository.existsBySlug(slug)) {

            String suffix = "-" + count;
            int maxBaseLength = 100 - suffix.length();

            String shortenedBase = baseSlug.substring(
                    0,
                    Math.min(baseSlug.length(), maxBaseLength)
            ).replaceAll("-+$", "");

            slug = shortenedBase + suffix;
            count++;
        }

        return slug;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormResponseDto> getAllForms() {

        return formRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FormResponseDto getFormById(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        return mapToResponse(form);
    }

    @Override
    @Transactional(readOnly = true)
    public FormResponseDto getFormBySlug(FormSlugDto dto) {

        FormEntity form = formRepository.findBySlug(dto.getSlug())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Form not found with slug: " + dto.getSlug()
                ));

        return mapToResponse(form);
    }

    @Override
    public FormResponseDto updateForm(UpdateFormDto dto) {

        FormEntity form = getForm(dto.getId());

        if (dto.getPackageId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tour package is required"
            );
        }

        TourPackage tourPackage = packageRepository
                .findById(dto.getPackageId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tour package not found with ID: " + dto.getPackageId()
                ));

        form.setFormTitle(dto.getFormTitle());
        form.setFormDescription(dto.getFormDescription());
        form.setAllowMultipleSubmissions(
                dto.getAllowMultipleSubmissions()
        );
        form.setExpiryDate(dto.getExpiryDate());
        form.setTourPackage(tourPackage);

        return mapToResponse(formRepository.save(form));
    }

    @Override
    public String deleteForm(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        formRepository.delete(form);

        return "Form deleted successfully";
    }

    @Override
    public FormResponseDto publishForm(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        if ("CLOSED".equals(form.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Closed form cannot be published."
            );
        }

        form.setStatus("PUBLISHED");

        return mapToResponse(formRepository.save(form));
    }

    @Override
    public FormResponseDto closeForm(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        form.setStatus("CLOSED");

        return mapToResponse(formRepository.save(form));
    }

    private FormEntity getForm(Long id) {

        return formRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Form not found with ID: " + id
                ));
    }

    private FormResponseDto mapToResponse(FormEntity form) {

        return FormResponseDto.builder()
                .id(form.getId())
                .formTitle(form.getFormTitle())
                .formDescription(form.getFormDescription())
                .slug(form.getSlug())
                .publicToken(form.getPublicToken())
                .status(form.getStatus())
                .allowMultipleSubmissions(
                        form.getAllowMultipleSubmissions()
                )
                .expiryDate(form.getExpiryDate())
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .packageId(
                        form.getTourPackage() != null
                                ? form.getTourPackage().getId()
                                : null
                )
                .tourPackageName(
                        form.getTourPackage() != null
                                ? form.getTourPackage().getTourName()
                                : null
                )
                .build();
    }
}
