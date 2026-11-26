
package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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

    private Long companyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<Long> packageIds;

    private List<String> tourPackageNames;
}
