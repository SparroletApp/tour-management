
package com.example.tourmanagement.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.tourmanagement.service.GarageStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class ImageUploadController {

    private final GarageStorageService garageStorageService;

    @Value("${garage.public-base-url}")
    private String publicBaseUrl;

    @PostMapping("/image")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(
            @RequestParam("file") MultipartFile file) {

        // Upload image to Garage S3
        String objectKey = garageStorageService.uploadImage(
                file,
                "uploads"
        );

        // Generate public image URL
        String imageUrl = publicBaseUrl.replaceAll("/+$", "")
                + "/" + objectKey;

        return Map.of(
                "message", "Image uploaded successfully",
                "imageUrl", imageUrl,
                "objectKey", objectKey
        );
    }
}
