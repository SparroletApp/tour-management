package com.example.tourmanagement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tour_optional_activitys")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourOptionalActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourPackageId;
    private String activityName;
    private String description;
    private BigDecimal price;
    private String currency;
    private String availabilityType;
    private Boolean active;

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

