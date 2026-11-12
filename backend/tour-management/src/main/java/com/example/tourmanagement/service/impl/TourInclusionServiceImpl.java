package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourInclusionDto;
import com.example.tourmanagement.entity.TourInclusion;
import com.example.tourmanagement.repository.TourInclusionRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourInclusionService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourInclusionServiceImpl extends AbstractCrudServiceImpl<TourInclusion, TourInclusionDto> implements TourInclusionService {

    private final TourInclusionRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourInclusion, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourInclusion> newEntity() {
        return TourInclusion::new;
    }

    @Override
    protected Supplier<TourInclusionDto> newDto() {
        return TourInclusionDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourInclusion entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourInclusionDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderBySequenceNumber(tourPackageId).stream().map(this::toDto).toList();
    }
}
