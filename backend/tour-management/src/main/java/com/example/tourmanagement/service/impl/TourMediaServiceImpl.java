package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.tourdto.TourMediaDto;
import com.example.tourmanagement.entity.TourMedia;
import com.example.tourmanagement.repository.TourMediaRepository;
import com.example.tourmanagement.repository.TourPackageRepository;
import com.example.tourmanagement.service.TourMediaService;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TourMediaServiceImpl extends AbstractCrudServiceImpl<TourMedia, TourMediaDto> implements TourMediaService {

    private final TourMediaRepository repository;
    private final TourPackageRepository parentRepository;

    @Override
    protected JpaRepository<TourMedia, Long> repo() {
        return repository;
    }

    @Override
    protected Supplier<TourMedia> newEntity() {
        return TourMedia::new;
    }

    @Override
    protected Supplier<TourMediaDto> newDto() {
        return TourMediaDto::new;
    }

    /** The parent can't be changed after creation. */
    @Override
    protected String[] lockedFields() {
        return new String[] { "tourPackageId" };
    }

    @Override
    protected void validate(TourMedia entity, Long id) {
        requireExists(parentRepository, entity.getTourPackageId(), "tourPackageId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourMediaDto> findByTourPackage(Long tourPackageId) {
        return repository.findByTourPackageIdOrderBySequenceNumber(tourPackageId).stream().map(this::toDto).toList();
    }
}
