
package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFormDto {

    private String formTitle;

    private Long companyId;

    private String formDescription;

    private Boolean allowMultipleSubmissions;

    private List<Long> packageIds;

    private LocalDateTime expiryDate;
}
