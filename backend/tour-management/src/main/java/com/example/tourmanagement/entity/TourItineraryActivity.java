package com.example.tourmanagement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tour_itinerary_activitys")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourItineraryActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itineraryDayId;
    private String activityName;
    private String description;
    private String activityType;
    private Boolean included;
    private Boolean optional;
    private Integer sequenceNumber;
    private BigDecimal additionalPrice;
    private String currency;

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
