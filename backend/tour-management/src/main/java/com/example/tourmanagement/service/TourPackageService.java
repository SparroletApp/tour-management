package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.tourdto.TourCompanyIdDto;
import com.example.tourmanagement.dto.tourdto.TourPackageDto;
import com.example.tourmanagement.dto.tourdto.TourPackageFullDto;
import com.example.tourmanagement.entity.TourPackage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TourPackageService extends CrudService<TourPackageDto> {

    TourPackageFullDto createFull(TourPackageFullDto request);
    TourPackageFullDto getFull(Long id);
    String uploadCoverImage(Long id, MultipartFile file);
    TourPackageFullDto updateFull(Long id, TourPackageFullDto request);
    List<TourPackageDto> getByCompanyId(TourCompanyIdDto request);
}
