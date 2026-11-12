package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourOptionalActivityDto;
import com.example.tourmanagement.entity.TourOptionalActivity;
import com.example.tourmanagement.repository.TourOptionalActivityRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourOptionalActivityService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourOptionalActivityServiceImpl extends AbstractCrudServiceImpl<TourOptionalActivity, TourOptionalActivityDto> implements TourOptionalActivityService {

    private final TourOptionalActivityRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourOptionalActivity, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourOptionalActivity> newEntity() {
        return TourOptionalActivity::new;
    }

    @Override
    protected Supplier<TourOptionalActivityDto> newDto() {
        return TourOptionalActivityDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourOptionalActivity entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    protected void prepare(TourOptionalActivity entity) {
        if (entity.getActive() == null) entity.setActive(true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourOptionalActivityDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageId(tourPackageId).stream().map(this::toDto).toList();
    }
}
