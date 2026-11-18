package com.example.tourmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class CompanyEntity extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String companyName;

}