package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourHotelDto;
import com.example.tourmanagement.entity.TourHotel;
import com.example.tourmanagement.repository.TourHotelRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourHotelService;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourHotelServiceImpl extends AbstractCrudServiceImpl<TourHotel, TourHotelDto> implements TourHotelService {

    private final TourHotelRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourHotel, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourHotel> newEntity() {
        return TourHotel::new;
    }

    @Override
    protected Supplier<TourHotelDto> newDto() {
        return TourHotelDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourHotel entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    protected void prepare(TourHotel entity) {
        if (entity.getNumberOfNights() == null && entity.getCheckInDate() != null
                && entity.getCheckOutDate() != null) {
            entity.setNumberOfNights((int) ChronoUnit.DAYS.between(entity.getCheckInDate(), entity.getCheckOutDate()));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourHotelDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderByCheckInDate(tourPackageId).stream().map(this::toDto).toList();
    }
}
