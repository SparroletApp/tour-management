package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourExclusionDto;
import com.example.tourmanagement.entity.TourExclusion;
import com.example.tourmanagement.repository.TourExclusionRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourExclusionService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourExclusionServiceImpl extends AbstractCrudServiceImpl<TourExclusion, TourExclusionDto> implements TourExclusionService {

    private final TourExclusionRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourExclusion, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourExclusion> newEntity() {
        return TourExclusion::new;
    }

    @Override
    protected Supplier<TourExclusionDto> newDto() {
        return TourExclusionDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourExclusion entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourExclusionDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderBySequenceNumber(tourPackageId).stream().map(this::toDto).toList();
    }
}
