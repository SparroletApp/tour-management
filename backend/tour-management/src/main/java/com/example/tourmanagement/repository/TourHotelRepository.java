package com.example.tourmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tourmanagement.entity.TourHotel;

public interface TourHotelRepository extends JpaRepository<TourHotel, Long> {
    List<TourHotel> findByTourPackageIdOrderByCheckInDate(Long tourPackageId);
}
