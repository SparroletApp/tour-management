package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourPriceRule;

public interface TourPriceRuleRepository extends JpaRepository<TourPriceRule, Long> {
    List<TourPriceRule> findByTourPackageId(Long tourPackageId);
}
