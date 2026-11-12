package com.example.tourmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormSubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private FormEntity form;

    @Column(length = 200)
    private String respondentName;

    @Column(length = 200)
    private String respondentEmail;

    @Column(length = 20)
    private String respondentPhone;

    @Column(nullable = false)
    private String status;

    private LocalDateTime submittedAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        submittedAt = LocalDateTime.now();

        if (status == null) {
            status = "SUBMITTED";
        }
    }
}