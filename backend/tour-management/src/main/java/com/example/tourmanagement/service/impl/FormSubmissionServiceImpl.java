
package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.submissiondto.*;
import com.example.tourmanagement.entity.FormEntity;
import com.example.tourmanagement.entity.FormSubmissionEntity;
import com.example.tourmanagement.repository.FormSubmissionRepository;
import com.example.tourmanagement.repository.FormsRepository;
import com.example.tourmanagement.service.FormSubmissionService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FormSubmissionServiceImpl implements FormSubmissionService {

    private final FormSubmissionRepository submissionRepository;
    private final FormsRepository formsRepository;

    @Override
    public SubmissionResponseDto createSubmission(CreateSubmissionDto dto) {

        FormEntity form = formsRepository.findById(dto.getFormId())
                .orElseThrow(() ->
                        new RuntimeException("Form not found with ID: " + dto.getFormId()));

        if (!"PUBLISHED".equalsIgnoreCase(form.getStatus())) {
            throw new RuntimeException("This form is not available for submissions");
        }

        if (form.getExpiryDate() != null &&
                form.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This form has expired");
        }

        if (!Boolean.TRUE.equals(form.getAllowMultipleSubmissions()) &&
                submissionRepository.countByFormId(form.getId()) > 0) {
            throw new RuntimeException("This form does not allow multiple submissions");
        }

        FormSubmissionEntity submission = new FormSubmissionEntity();

        submission.setForm(form);
        submission.setRespondentName(dto.getRespondentName());
        submission.setRespondentEmail(dto.getRespondentEmail());
        submission.setRespondentPhone(dto.getRespondentPhone());
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(LocalDateTime.now());

        FormSubmissionEntity saved = submissionRepository.save(submission);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponseDto> getSubmissionsByForm(SubmissionIdDto dto) {

        List<FormSubmissionEntity> submissions =
                submissionRepository.findByFormIdOrderBySubmittedAtDesc(dto.getId());

        return submissions.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponseDto getSubmissionById(SubmissionIdDto dto) {

        FormSubmissionEntity submission =
                submissionRepository.findById(dto.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Submission not found with ID: " + dto.getId()
                                ));

        return mapToResponse(submission);
    }

    @Override
    public String deleteSubmission(SubmissionIdDto dto) {

        FormSubmissionEntity submission =
                submissionRepository.findById(dto.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Submission not found with ID: " + dto.getId()
                                ));

        submissionRepository.delete(submission);

        return "Submission deleted successfully";
    }

    private SubmissionResponseDto mapToResponse(FormSubmissionEntity submission) {

        return SubmissionResponseDto.builder()
                .id(submission.getId())
                .formId(submission.getForm().getId())
                .formTitle(submission.getForm().getFormTitle())
                .respondentName(submission.getRespondentName())
                .respondentEmail(submission.getRespondentEmail())
                .respondentPhone(submission.getRespondentPhone())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}
