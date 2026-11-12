package com.example.tourmanagement.service;

import java.util.List;

import com.example.tourmanagement.dto.tourdto.TourPriceRuleDto;

public interface TourPriceRuleService extends CrudService<TourPriceRuleDto> {

    List<TourPriceRuleDto> findByTourPackage(Long tourPackageId);
}
