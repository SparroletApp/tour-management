package com.example.tourmanagement.service.impl;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.Supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.tourmanagement.dto.tourdto.*;
import com.example.tourmanagement.entity.*;
import com.example.tourmanagement.repository.*;
import com.example.tourmanagement.service.TourPackageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourPackageServiceImpl extends AbstractCrudServiceImpl<TourPackage, TourPackageDto>
        implements TourPackageService {

    private final TourPackageRepository packageRepo;
    private final TourDestinationRepository destinationRepo;
    private final TourFlightRepository flightRepo;
    private final TourHotelRepository hotelRepo;
    private final TourItineraryDayRepository dayRepo;
    private final TourItineraryActivityRepository activityRepo;
    private final TourInclusionRepository inclusionRepo;
    private final TourExclusionRepository exclusionRepo;
    private final TourOptionalActivityRepository optionalActivityRepo;
    private final TourPriceRuleRepository priceRuleRepo;
    private final TourMediaRepository mediaRepo;

    // ---------- AbstractCrudServiceImpl hooks ----------

    @Override
    protected JpaRepository<TourPackage, Long> repo() {
        return packageRepo;
    }

    @Override
    protected Supplier<TourPackage> newEntity() {
        return TourPackage::new;
    }

    @Override
    protected Supplier<TourPackageDto> newDto() {
        return TourPackageDto::new;
    }

    @Override
    protected void validate(TourPackage p, Long id) {
        if (p.getTourName() == null || p.getTourName().isBlank()) {
            throw bad("tourName is required");
        }
        if (p.getTourCode() != null && !p.getTourCode().isBlank()) {
            packageRepo.findByTourCode(p.getTourCode()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "tourCode already exists: " + p.getTourCode());
                }
            });
        }
        if (p.getStartDate() != null && p.getEndDate() != null && p.getEndDate().isBefore(p.getStartDate())) {
            throw bad("endDate cannot be before startDate");
        }
        if (p.getMinimumTravellers() != null && p.getMaximumTravellers() != null
                && p.getMaximumTravellers() < p.getMinimumTravellers()) {
            throw bad("maximumTravellers cannot be less than minimumTravellers");
        }
    }

    @Override
    protected void prepare(TourPackage p) {
        if (p.getStatus() == null || p.getStatus().isBlank()) {
            p.setStatus("DRAFT");
        }
        if (p.getDurationDays() == null && p.getStartDate() != null && p.getEndDate() != null) {
            int days = (int) ChronoUnit.DAYS.between(p.getStartDate(), p.getEndDate()) + 1;
            p.setDurationDays(days);
            if (p.getDurationNights() == null) {
                p.setDurationNights(Math.max(days - 1, 0));
            }
        }
    }

    /** Deleting a package also deletes everything that belongs to it (no JPA cascade, only plain ids). */
    @Override
    @Transactional
    public void delete(Long id) {
        findEntity(id); // 404 if missing
        deleteChildren(id);
        packageRepo.deleteById(id);
    }


    @Override
    @Transactional
    public TourPackageFullDto createFull(TourPackageFullDto req) {

        if (req == null || req.getTourPackage() == null) {
            throw bad("tourPackage is required");
        }

        TourPackage pkg = toEntity(req.getTourPackage());

        // Automatically generate tour code
        pkg.setTourCode(generateTourCode());

        validate(pkg, null);
        prepare(pkg);

        pkg = packageRepo.save(pkg);

        saveChildren(pkg.getId(), req);

        return getFull(pkg.getId());
    }

    @Override
    @Transactional
    public TourPackageFullDto updateFull(Long id, TourPackageFullDto req) {
        if (req == null || req.getTourPackage() == null) {
            throw bad("tourPackage is required");
        }
        TourPackage existing = findEntity(id);
        org.springframework.beans.BeanUtils.copyProperties(req.getTourPackage(), existing, IGNORED);
        validate(existing, id);
        prepare(existing);
        packageRepo.save(existing);

        deleteChildren(id);
        saveChildren(id, req);
        return getFull(id);
    }

    @Override
    @Transactional(readOnly = true)
    public TourPackageFullDto getFull(Long id) {
        TourPackage pkg = findEntity(id);

        TourPackageFullDto full = new TourPackageFullDto();
        full.setTourPackage(toDto(pkg));
        full.setDestinations(destinationRepo.findByTourPackageIdOrderBySequenceNumber(id).stream()
                .map(e -> copy(e, TourDestinationDto::new)).toList());
        full.setFlights(flightRepo.findByTourPackageIdOrderByDepartureDateTime(id).stream()
                .map(e -> copy(e, TourFlightDto::new)).toList());
        full.setHotels(hotelRepo.findByTourPackageIdOrderByCheckInDate(id).stream()
                .map(e -> copy(e, TourHotelDto::new)).toList());

        List<TourItineraryDayDto> days = new ArrayList<>();
        for (TourItineraryDay d : dayRepo.findByTourPackageIdOrderByDayNumber(id)) {
            TourItineraryDayDto dd = copy(d, TourItineraryDayDto::new);
            dd.setActivities(activityRepo.findByItineraryDayIdOrderBySequenceNumber(d.getId()).stream()
                    .map(a -> copy(a, TourItineraryActivityDto::new)).toList());
            days.add(dd);
        }
        full.setItineraryDays(days);

        full.setInclusions(inclusionRepo.findByTourPackageIdOrderBySequenceNumber(id).stream()
                .map(e -> copy(e, TourInclusionDto::new)).toList());
        full.setExclusions(exclusionRepo.findByTourPackageIdOrderBySequenceNumber(id).stream()
                .map(e -> copy(e, TourExclusionDto::new)).toList());
        full.setOptionalActivities(optionalActivityRepo.findByTourPackageId(id).stream()
                .map(e -> copy(e, TourOptionalActivityDto::new)).toList());
        full.setPriceRules(priceRuleRepo.findByTourPackageId(id).stream()
                .map(e -> copy(e, TourPriceRuleDto::new)).toList());
        full.setMedia(mediaRepo.findByTourPackageIdOrderBySequenceNumber(id).stream()
                .map(e -> copy(e, TourMediaDto::new)).toList());
        return full;
    }

    // ---------- helpers ----------

    private void saveChildren(Long pid, TourPackageFullDto req) {
        String packageCurrency = req.getTourPackage().getCurrency();

        List<TourDestination> destinations = new ArrayList<>();
        for (TourDestinationDto dto : orEmpty(req.getDestinations())) {
            TourDestination e = copy(dto, TourDestination::new, IGNORED);
            e.setTourPackageId(pid);
            destinations.add(e);
        }
        autoSequence(destinations, TourDestination::getSequenceNumber, TourDestination::setSequenceNumber);
        destinationRepo.saveAll(destinations);

        List<TourFlight> flights = new ArrayList<>();
        for (TourFlightDto dto : orEmpty(req.getFlights())) {
            TourFlight e = copy(dto, TourFlight::new, IGNORED);
            e.setTourPackageId(pid);
            flights.add(e);
        }
        flightRepo.saveAll(flights);

        List<TourHotel> hotels = new ArrayList<>();
        for (TourHotelDto dto : orEmpty(req.getHotels())) {
            TourHotel e = copy(dto, TourHotel::new, IGNORED);
            e.setTourPackageId(pid);
            if (e.getNumberOfNights() == null && e.getCheckInDate() != null && e.getCheckOutDate() != null) {
                e.setNumberOfNights((int) ChronoUnit.DAYS.between(e.getCheckInDate(), e.getCheckOutDate()));
            }
            hotels.add(e);
        }
        hotelRepo.saveAll(hotels);

        List<TourInclusion> inclusions = new ArrayList<>();
        for (TourInclusionDto dto : orEmpty(req.getInclusions())) {
            TourInclusion e = copy(dto, TourInclusion::new, IGNORED);
            e.setTourPackageId(pid);
            inclusions.add(e);
        }
        autoSequence(inclusions, TourInclusion::getSequenceNumber, TourInclusion::setSequenceNumber);
        inclusionRepo.saveAll(inclusions);

        List<TourExclusion> exclusions = new ArrayList<>();
        for (TourExclusionDto dto : orEmpty(req.getExclusions())) {
            TourExclusion e = copy(dto, TourExclusion::new, IGNORED);
            e.setTourPackageId(pid);
            exclusions.add(e);
        }
        autoSequence(exclusions, TourExclusion::getSequenceNumber, TourExclusion::setSequenceNumber);
        exclusionRepo.saveAll(exclusions);

        List<TourOptionalActivity> optionals = new ArrayList<>();
        for (TourOptionalActivityDto dto : orEmpty(req.getOptionalActivities())) {
            TourOptionalActivity e = copy(dto, TourOptionalActivity::new, IGNORED);
            e.setTourPackageId(pid);
            if (e.getActive() == null) e.setActive(true);
            optionals.add(e);
        }
        optionalActivityRepo.saveAll(optionals);

        List<TourPriceRule> priceRules = new ArrayList<>();
        for (TourPriceRuleDto dto : orEmpty(req.getPriceRules())) {
            TourPriceRule e = copy(dto, TourPriceRule::new, IGNORED);
            e.setTourPackageId(pid);
            if (e.getCurrency() == null) e.setCurrency(packageCurrency);
            priceRules.add(e);
        }
        priceRuleRepo.saveAll(priceRules);

        List<TourMedia> media = new ArrayList<>();
        for (TourMediaDto dto : orEmpty(req.getMedia())) {
            TourMedia e = copy(dto, TourMedia::new, IGNORED);
            e.setTourPackageId(pid);
            media.add(e);
        }
        autoSequence(media, TourMedia::getSequenceNumber, TourMedia::setSequenceNumber);
        mediaRepo.saveAll(media);

        // Days first, then their activities (activities need the saved day id)
        int dayIndex = 0;
        for (TourItineraryDayDto dd : orEmpty(req.getItineraryDays())) {
            dayIndex++;
            TourItineraryDay day = copy(dd, TourItineraryDay::new, IGNORED);
            day.setTourPackageId(pid);
            if (day.getDayNumber() == null) day.setDayNumber(dayIndex);
            day = dayRepo.save(day);

            List<TourItineraryActivity> acts = new ArrayList<>();
            for (TourItineraryActivityDto ad : orEmpty(dd.getActivities())) {
                TourItineraryActivity a = copy(ad, TourItineraryActivity::new, IGNORED);
                a.setItineraryDayId(day.getId());
                if (a.getIncluded() == null) a.setIncluded(true);
                if (a.getOptional() == null) a.setOptional(false);
                acts.add(a);
            }
            autoSequence(acts, TourItineraryActivity::getSequenceNumber, TourItineraryActivity::setSequenceNumber);
            activityRepo.saveAll(acts);
        }
    }

    private void deleteChildren(Long id) {
        for (TourItineraryDay d : dayRepo.findByTourPackageIdOrderByDayNumber(id)) {
            activityRepo.deleteAll(activityRepo.findByItineraryDayIdOrderBySequenceNumber(d.getId()));
        }
        dayRepo.deleteAll(dayRepo.findByTourPackageIdOrderByDayNumber(id));
        destinationRepo.deleteAll(destinationRepo.findByTourPackageIdOrderBySequenceNumber(id));
        flightRepo.deleteAll(flightRepo.findByTourPackageIdOrderByDepartureDateTime(id));
        hotelRepo.deleteAll(hotelRepo.findByTourPackageIdOrderByCheckInDate(id));
        inclusionRepo.deleteAll(inclusionRepo.findByTourPackageIdOrderBySequenceNumber(id));
        exclusionRepo.deleteAll(exclusionRepo.findByTourPackageIdOrderBySequenceNumber(id));
        optionalActivityRepo.deleteAll(optionalActivityRepo.findByTourPackageId(id));
        priceRuleRepo.deleteAll(priceRuleRepo.findByTourPackageId(id));
        mediaRepo.deleteAll(mediaRepo.findByTourPackageIdOrderBySequenceNumber(id));
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }

    private String generateTourCode() {
        String prefix = "TOUR-";

        Long nextId = packageRepo.getNextTourPackageId();

        return prefix + String.format("%04d", nextId);
    }
    private <T> void autoSequence(List<T> items, Function<T, Integer> getter, BiConsumer<T, Integer> setter) {
        for (int i = 0; i < items.size(); i++) {
            if (getter.apply(items.get(i)) == null) {
                setter.accept(items.get(i), i + 1);
            }
        }
    }
}
