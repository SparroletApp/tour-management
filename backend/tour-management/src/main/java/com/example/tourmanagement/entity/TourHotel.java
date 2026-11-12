package com.example.tourmanagement.entity;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tour_hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TourHotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tourPackageId;
    private String cityName;
    private String hotelName;
    private String hotelCategory;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfNights;
    private String address;
    private String contactNumber;
    private String remarks;
    @Column(name = "images", columnDefinition = "text[]", nullable = true)
    private String[] images;

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

