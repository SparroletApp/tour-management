package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourFlightDto;
import com.example.tourmanagement.entity.TourFlight;
import com.example.tourmanagement.repository.TourFlightRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourFlightService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourFlightServiceImpl extends AbstractCrudServiceImpl<TourFlight, TourFlightDto> implements TourFlightService {

    private final TourFlightRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourFlight, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourFlight> newEntity() {
        return TourFlight::new;
    }

    @Override
    protected Supplier<TourFlightDto> newDto() {
        return TourFlightDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourFlight entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourFlightDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderByDepartureDateTime(tourPackageId).stream().map(this::toDto).toList();
    }
}
