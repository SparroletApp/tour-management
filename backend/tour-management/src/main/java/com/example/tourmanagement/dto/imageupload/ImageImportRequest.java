package com.example.tourmanagement.dto.imageupload;

import jakarta.validation.constraints.NotBlank;

public record ImageImportRequest(
        @NotBlank String url
) {}
