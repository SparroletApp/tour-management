package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourPriceRuleDto;
import com.example.tourmanagement.entity.TourPriceRule;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.repository.TourPriceRuleRepository;
import com.example.tourmanagement.service.TourPriceRuleService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourPriceRuleServiceImpl extends AbstractCrudServiceImpl<TourPriceRule, TourPriceRuleDto> implements TourPriceRuleService {

    private final TourPriceRuleRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourPriceRule, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourPriceRule> newEntity() {
        return TourPriceRule::new;
    }

    @Override
    protected Supplier<TourPriceRuleDto> newDto() {
        return TourPriceRuleDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourPriceRule entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourPriceRuleDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageId(tourPackageId).stream().map(this::toDto).toList();
    }
}
