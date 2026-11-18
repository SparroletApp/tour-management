package com.example.tourmanagement.repository;

import com.example.tourmanagement.entity.CompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEntity, Long> {

    boolean existsByCompanyName(String companyName);

    boolean existsByCompanyNameAndIdNot(String companyName, Long id);
}