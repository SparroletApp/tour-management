package com.example.tourmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormQuestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Question belongs to a section
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private FormSectionEntity section;

    @Column(nullable = false, length = 500)
    private String questionTitle;

    // TEXT, TEXTAREA, NUMBER, EMAIL, DATE,
    // DROPDOWN, RADIO, CHECKBOX, FILE
    @Column(nullable = false, length = 100)
    private String fieldType;

    @Column(nullable = false)
    private Boolean required;

    @Column(columnDefinition = "TEXT")
    private String placeholder;

    @Column(columnDefinition = "TEXT")
    private String helpText;

    // Dropdown, radio and checkbox options
    @Column(columnDefinition = "TEXT")
    private String options;

    private Integer displayOrder;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

        if (required == null) {
            required = false;
        }
    }
}