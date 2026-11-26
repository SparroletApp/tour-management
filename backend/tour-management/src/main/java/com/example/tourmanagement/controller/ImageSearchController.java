
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.imageupload.ImageImportRequest;
import com.example.tourmanagement.dto.imageupload.ImageImportResponse;
import com.example.tourmanagement.dto.imageupload.ImageSearchResponse;
import com.example.tourmanagement.service.GarageStorageService;
import com.example.tourmanagement.service.PexelsService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageSearchController {

    private static final Logger log =
            LoggerFactory.getLogger(ImageSearchController.class);

    private final PexelsService pexelsService;
    private final GarageStorageService storageService;

    @Value("${app.base-url}")
    private String appBaseUrl;

    public ImageSearchController(
            PexelsService pexelsService,
            GarageStorageService storageService) {

        this.pexelsService = pexelsService;
        this.storageService = storageService;
    }

    // Search images using Pexels
    @GetMapping("/search")
    public ImageSearchResponse search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page) {

        return new ImageSearchResponse(
                pexelsService.search(q.trim(), page)
        );
    }

    // Import selected Pexels image into Garage storage
    @PostMapping("/import")
    public ResponseEntity<?> importImage(
            @Valid @RequestBody ImageImportRequest req) {

        try {

            byte[] bytes = pexelsService.download(req.url());

            log.info(
                    "Downloaded image from Pexels, {} bytes",
                    bytes.length
            );

            MultipartFile file = new ByteArrayMultipartFile(
                    "file",
                    "pexels.jpg",
                    "image/jpeg",
                    bytes
            );

            // Save to existing uploads folder
            String objectKey = storageService.uploadImage(
                    file,
                    "uploads"
            );

            String savedUrl =
                    appBaseUrl.replaceAll("/+$", "")
                            + "/" + objectKey;

            log.info("Saved image: {}", savedUrl);

            return ResponseEntity.ok(
                    new ImageImportResponse(savedUrl)
            );

        } catch (IllegalArgumentException e) {

            log.warn(
                    "Image import rejected: {}",
                    e.getMessage()
            );

            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {

            log.error("Image import failed", e);

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Could not save the image: " + e.getMessage()
                    ));
        }
    }

    /**
     * Wraps downloaded bytes as MultipartFile
     * so existing Garage upload logic can be reused.
     */
    private static class ByteArrayMultipartFile
            implements MultipartFile {

        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        ByteArrayMultipartFile(
                String name,
                String originalFilename,
                String contentType,
                byte[] content) {

            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() {
            return content;
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException {
            Files.write(dest.toPath(), content);
        }
    }
}
