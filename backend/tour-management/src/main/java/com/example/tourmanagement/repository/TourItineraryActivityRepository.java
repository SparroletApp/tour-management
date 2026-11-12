package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourItineraryActivity;

public interface TourItineraryActivityRepository extends JpaRepository<TourItineraryActivity, Long> {
    List<TourItineraryActivity> findByItineraryDayIdOrderBySequenceNumber(Long itineraryDayId);
}
