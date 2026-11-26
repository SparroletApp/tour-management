package com.example.tourmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String formTitle;

    @Column(nullable = false, length = 100)
    private String slug;

    @OneToMany(mappedBy = "form", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TourPackage> tourPackages = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String formDescription;

    @Column(nullable = false, unique = true, length = 100)
    private String publicToken;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Boolean allowMultipleSubmissions;

    private LocalDateTime expiryDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "company_id", nullable = true)
    private CompanyEntity company;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = "DRAFT";
        }

        if (allowMultipleSubmissions == null) {
            allowMultipleSubmissions = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}