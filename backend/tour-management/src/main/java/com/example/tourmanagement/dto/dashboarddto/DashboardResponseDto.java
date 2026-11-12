package com.example.tourmanagement.dto.dashboarddto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDto {

    private Long totalTourPackages;
    private Long publishedTourPackages;
    private Long draftTourPackages;
    private Long closedTourPackages;

    private Long totalForms;
    private Long publishedForms;
    private Long draftForms;
    private Long closedForms;
}