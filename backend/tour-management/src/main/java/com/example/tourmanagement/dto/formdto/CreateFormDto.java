package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFormDto {

    private String formTitle;

    private String formDescription;

    private Boolean allowMultipleSubmissions;
    private Long packageId;

    private LocalDateTime expiryDate;
}