
package com.example.tourmanagement.dto.formdto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFormDto {

    private Long id;

    private String formTitle;

    private Long companyId;

    private String formDescription;

    private List<Long> packageIds;

    private Boolean allowMultipleSubmissions;

    private LocalDateTime expiryDate;
}
