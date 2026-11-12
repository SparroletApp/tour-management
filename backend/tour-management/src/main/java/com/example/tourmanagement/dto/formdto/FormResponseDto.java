package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormResponseDto {

    private Long id;

    private String formTitle;

    private String formDescription;

    private String publicToken;

    private String status;
    private String slug;

    private Boolean allowMultipleSubmissions;

    private LocalDateTime expiryDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private Long packageId;

    private String tourPackageName;
}