package com.example.tourmanagement.entity;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "tour_destinations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourDestination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourPackageId;
    private String countryName;
    private String cityName;
    private String description;
    @Column(name = "image_url", length = 1000)
    private String imageUrl;
    private Integer sequenceNumber;

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
