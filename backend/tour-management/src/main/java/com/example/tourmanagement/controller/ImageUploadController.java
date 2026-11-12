
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

import com.example.tourmanagement.service.impl.FileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class ImageUploadController {

    private final FileStorageService fileStorageService;

    @Value("${app.base-url}")
    private String baseUrl;

    @PostMapping("/image")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String imagePath = fileStorageService.uploadImage(file);

        String imageUrl = baseUrl.replaceAll("/$", "") + imagePath;

        return Map.of(
                "message", "Image uploaded successfully",
                "imageUrl", imageUrl
        );
    }
}
