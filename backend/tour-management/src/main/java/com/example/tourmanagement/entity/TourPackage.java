package com.example.tourmanagement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tour_packages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tourCode;
    private String tourName;
    private String description;
    private Integer durationDays;
    private Integer durationNights;
    private Integer minimumTravellers;
    private Integer maximumTravellers;
    private String currency;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverImageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

