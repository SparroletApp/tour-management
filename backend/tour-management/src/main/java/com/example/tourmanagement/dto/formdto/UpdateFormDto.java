package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFormDto {

    private Long id;

    private String formTitle;

    private String formDescription;
    private Long packageId;

    private Boolean allowMultipleSubmissions;

    private LocalDateTime expiryDate;
}