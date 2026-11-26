package com.example.tourmanagement.dto.termsdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TermsUpdateDto {

    @NotNull(message = "ID is required")
    private Long id;

    @NotBlank(message = "Terms name is required")
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;
    private Long companyId;


    @NotBlank(message = "Description is required")
    private String description;
}

