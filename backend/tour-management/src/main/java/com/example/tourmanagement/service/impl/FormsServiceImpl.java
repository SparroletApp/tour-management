
package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.formdto.CreateFormDto;
import com.example.tourmanagement.dto.formdto.UpdateFormDto;
import com.example.tourmanagement.dto.formdto.FormIdDto;
import com.example.tourmanagement.dto.formdto.FormSlugDto;
import com.example.tourmanagement.dto.formdto.FormCompanyIdDto;
import com.example.tourmanagement.dto.formdto.FormResponseDto;

import com.example.tourmanagement.dto.tourdto.TourCodeRequestDto;
import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.TourPackage;
import com.example.tourmanagement.entity.CompanyEntity;

import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.repository.CompanyRepository;

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
    private final CompanyRepository companyRepository;

    @Override
    public FormResponseDto createForm(CreateFormDto dto) {

        CompanyEntity company = null;
        TourPackage tourPackage = null;

        // Find company only when company ID is provided
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Company not found with ID: " + dto.getCompanyId()
                    ));
        }

        // Find tour package only when package ID is provided
        if (dto.getPackageId() != null) {
            tourPackage = packageRepository.findById(dto.getPackageId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Tour package not found with ID: " + dto.getPackageId()
                    ));
        }

        // Validate package belongs to company only when both are provided
        if (company != null && tourPackage != null) {

            if (tourPackage.getCompany() == null ||
                    !tourPackage.getCompany().getId().equals(company.getId())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected tour package does not belong to this company"
                );
            }
        }

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
                .company(company)
                .build();

        FormEntity savedForm = formRepository.save(form);

        return mapToResponse(savedForm);
    }

    // GENERATE UNIQUE SLUG
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
    public FormResponseDto getPublishedByTourCode(TourCodeRequestDto dto) {

        if (dto.getTourCode() == null || dto.getTourCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tour code is required"
            );
        }

        FormEntity form = formRepository
                .findFirstByTourPackage_TourCodeAndStatus(
                        dto.getTourCode().trim(),
                        "PUBLISHED"
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No published form found for tour code: " + dto.getTourCode()
                ));

        return mapToResponse(form);
    }

    // GET ALL FORMS
    @Override
    @Transactional(readOnly = true)
    public List<FormResponseDto> getAllForms() {

        return formRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET FORMS BY COMPANY ID
    @Override
    @Transactional(readOnly = true)
    public List<FormResponseDto> getFormsByCompany(FormCompanyIdDto dto) {

        if (dto.getCompanyId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Company ID is required"
            );
        }

        if (!companyRepository.existsById(dto.getCompanyId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Company not found with ID: " + dto.getCompanyId()
            );
        }

        return formRepository.findByCompany_Id(dto.getCompanyId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET FORM BY ID
    @Override
    @Transactional(readOnly = true)
    public FormResponseDto getFormById(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        return mapToResponse(form);
    }

    // GET FORM BY SLUG
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

        if (dto.getFormTitle() == null || dto.getFormTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Form title is required"
            );
        }

        CompanyEntity company = null;
        TourPackage tourPackage = null;

        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Company not found with ID: " + dto.getCompanyId()
                    ));
        }

        if (dto.getPackageId() != null) {
            tourPackage = packageRepository.findById(dto.getPackageId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Tour package not found with ID: " + dto.getPackageId()
                    ));
        }

        if (company != null && tourPackage != null) {

            if (tourPackage.getCompany() == null ||
                    !tourPackage.getCompany().getId().equals(company.getId())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected tour package does not belong to this company"
                );
            }
        }

        form.setFormTitle(dto.getFormTitle());
        form.setFormDescription(dto.getFormDescription());

        form.setAllowMultipleSubmissions(
                dto.getAllowMultipleSubmissions() != null
                        ? dto.getAllowMultipleSubmissions()
                        : form.getAllowMultipleSubmissions()
        );

        form.setExpiryDate(dto.getExpiryDate());

        form.setTourPackage(tourPackage);
        form.setCompany(company);

        return mapToResponse(formRepository.save(form));
    }

    // DELETE FORM
    @Override
    public String deleteForm(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        formRepository.delete(form);

        return "Form deleted successfully";
    }

    // PUBLISH FORM
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

    // CLOSE FORM
    @Override
    public FormResponseDto closeForm(FormIdDto dto) {

        FormEntity form = getForm(dto.getId());

        form.setStatus("CLOSED");

        return mapToResponse(formRepository.save(form));
    }

    // GET FORM BY ID
    private FormEntity getForm(Long id) {

        return formRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Form not found with ID: " + id
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormResponseDto> getPublicForms() {

        return formRepository.findByCompanyIsNull()
                .stream()
                .map(this::mapToResponse)
                .toList();
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
                .companyId(
                        form.getCompany() != null
                                ? form.getCompany().getId()
                                : null
                )
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
