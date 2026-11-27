
package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.imageupload.ImageImportRequest;
import com.example.tourmanagement.dto.imageupload.ImageImportResponse;
import com.example.tourmanagement.dto.imageupload.ImageSearchResponse;
import com.example.tourmanagement.service.UnsplashService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageSearchController {

    private static final Logger log =
            LoggerFactory.getLogger(ImageSearchController.class);

    private final UnsplashService unsplashService;

    public ImageSearchController(
            UnsplashService unsplashService) {

        this.unsplashService = unsplashService;
    }

    @GetMapping("/search")
    public ImageSearchResponse search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page) {

        return new ImageSearchResponse(
                unsplashService.search(q.trim(), page)
        );
    }

    @PostMapping("/import")
    public ResponseEntity<?> importImage(
            @Valid @RequestBody ImageImportRequest req) {

        try {

            unsplashService.trackDownload(
                    req.downloadLocation()
            );

            log.info(
                    "Unsplash image selected successfully: {}",
                    req.url()
            );

            return ResponseEntity.ok(
                    new ImageImportResponse(req.url())
            );

        } catch (IllegalArgumentException e) {

            log.warn(
                    "Unsplash image import rejected: {}",
                    e.getMessage()
            );

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));

        } catch (Exception e) {

            log.error("Unsplash image import failed", e);

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Could not process the selected image."
                    ));
        }
    }
}
