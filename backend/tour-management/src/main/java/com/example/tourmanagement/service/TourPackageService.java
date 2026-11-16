package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.tourdto.TourPackageDto;
import com.example.tourmanagement.dto.tourdto.TourPackageFullDto;
import org.springframework.web.multipart.MultipartFile;

public interface TourPackageService extends CrudService<TourPackageDto> {

    TourPackageFullDto createFull(TourPackageFullDto request);
    TourPackageFullDto getFull(Long id);
    String uploadCoverImage(Long id, MultipartFile file);
    TourPackageFullDto updateFull(Long id, TourPackageFullDto request);
}
