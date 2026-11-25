package com.example.tourmanagement.dto.imageupload;

public record ImageResultDto
        (
                long id,
                String thumb,
                String full,
                String credit,
                String link
        ) {}
