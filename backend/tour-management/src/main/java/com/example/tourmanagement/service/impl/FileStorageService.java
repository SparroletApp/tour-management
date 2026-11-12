
package com.example.tourmanagement.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path fileUploadPath;

    public String uploadImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select an image"
            );
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG, WEBP and GIF images are allowed"
            );
        }

        try {
            Files.createDirectories(fileUploadPath);

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null
                            ? "image"
                            : file.getOriginalFilename()
            );

            String extension = "";

            int dot = originalName.lastIndexOf(".");

            if (dot >= 0) {
                extension = originalName.substring(dot).toLowerCase();
            }

            String fileName = UUID.randomUUID() + extension;

            Path destination = fileUploadPath.resolve(fileName).normalize();

            if (!destination.startsWith(fileUploadPath)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid file name"
                );
            }

            Files.copy(file.getInputStream(), destination);

            return "/uploads/" + fileName;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Image upload failed"
            );
        }
    }
}
