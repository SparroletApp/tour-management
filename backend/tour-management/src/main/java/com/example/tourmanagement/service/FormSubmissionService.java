package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.submissiondto.*;

import java.util.List;

public interface FormSubmissionService {

    SubmissionResponseDto createSubmission(CreateSubmissionDto dto);

    List<SubmissionResponseDto> getSubmissionsByForm(SubmissionIdDto dto);

    SubmissionResponseDto getSubmissionById(SubmissionIdDto dto);
    List<SubmissionResponseDto> getSubmissionsByPackage(
            PackageSubmissionIdDto dto
    );
    String deleteSubmission(SubmissionIdDto dto);
}