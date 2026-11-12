package com.example.tourmanagement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tour_price_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourPriceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourPackageId;
    private String passengerCategory;
    private String roomCategory;
    private BigDecimal price;
    private String currency;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private String remarks;

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

