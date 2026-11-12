package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourItineraryDayDto;
import com.example.tourmanagement.entity.TourItineraryDay;
import com.example.tourmanagement.repository.TourItineraryActivityRepository;
import com.example.tourmanagement.repository.TourItineraryDayRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourItineraryDayService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourItineraryDayServiceImpl extends AbstractCrudServiceImpl<TourItineraryDay, TourItineraryDayDto> implements TourItineraryDayService {

    private final TourItineraryDayRepository repository;
    private final TourPackageRepository parentRepository;
    private final TourItineraryActivityRepository activityRepository;

    @Override
    protected JpaRepository<TourItineraryDay, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourItineraryDay> newEntity() {
        return TourItineraryDay::new;
    }

    @Override
    protected Supplier<TourItineraryDayDto> newDto() {
        return TourItineraryDayDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourItineraryDay entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourItineraryDayDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderByDayNumber(tourPackageId).stream().map(this::toDto).toList();
    }

    /** Deleting a day also deletes its activities (there is no JPA cascade, only plain ids). */
    @Override
    @Transactional
    public void delete(Long id) {
        TourItineraryDay day = findEntity(id);
        activityRepository.deleteAll(activityRepository.findByItineraryDayIdOrderBySequenceNumber(id));
        repository.delete(day);
    }
}
