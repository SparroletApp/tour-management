package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourDestinationDto;
import com.example.tourmanagement.entity.TourDestination;
import com.example.tourmanagement.repository.TourDestinationRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourDestinationService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourDestinationServiceImpl extends AbstractCrudServiceImpl<TourDestination, TourDestinationDto> implements TourDestinationService {

    private final TourDestinationRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourDestination, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourDestination> newEntity() {
        return TourDestination::new;
    }

    @Override
    protected Supplier<TourDestinationDto> newDto() {
        return TourDestinationDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourDestination entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourDestinationDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderBySequenceNumber(tourPackageId).stream().map(this::toDto).toList();
    }
}
