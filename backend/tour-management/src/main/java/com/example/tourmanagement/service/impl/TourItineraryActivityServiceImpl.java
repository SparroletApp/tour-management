package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourItineraryActivityDto;
import com.example.tourmanagement.entity.TourItineraryActivity;
import com.example.tourmanagement.repository.TourItineraryActivityRepository;
import com.example.tourmanagement.repository.TourItineraryDayRepository;
import com.example.tourmanagement.service.TourItineraryActivityService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourItineraryActivityServiceImpl extends AbstractCrudServiceImpl<TourItineraryActivity, TourItineraryActivityDto> implements TourItineraryActivityService {

    private final TourItineraryActivityRepository repository;
    private final TourItineraryDayRepository parentRepository;

    @Override
    protected JpaRepository<TourItineraryActivity, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourItineraryActivity> newEntity() {
        return TourItineraryActivity::new;
    }

    @Override
    protected Supplier<TourItineraryActivityDto> newDto() {
        return TourItineraryActivityDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "itineraryDayId" };
    }

    @Override
    protected void validate(TourItineraryActivity entity, Long id) {
        requireExists(parentRepository, entity.getItineraryDayId(), "itineraryDayId");
    }

    @Override
    protected void prepare(TourItineraryActivity entity) {
        if (entity.getIncluded() == null) entity.setIncluded(true);
        if (entity.getOptional() == null) entity.setOptional(false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourItineraryActivityDto> findByItineraryDay(Long itineraryDayId) {
        return repository.findByItineraryDayIdOrderBySequenceNumber(itineraryDayId).stream().map(this::toDto).toList();
    }
}
