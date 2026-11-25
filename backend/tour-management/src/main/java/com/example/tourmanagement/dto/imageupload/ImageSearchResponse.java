package com.example.tourmanagement.dto.imageupload;

import java.util.List;

public record ImageSearchResponse(
        List<ImageResultDto> images
) {}