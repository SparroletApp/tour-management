package com.example.tourmanagement.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

@RestController
@RequiredArgsConstructor
public class ImageServeController {

    private final S3Client s3Client;

    @Value("${garage.bucket}")
    private String bucket;

    @GetMapping("/uploads/{name:.+}")
    public ResponseEntity<byte[]> serve(@PathVariable String name) {
        try {
            ResponseBytes<GetObjectResponse> obj = s3Client.getObjectAsBytes(
                    GetObjectRequest.builder()
                            .bucket(bucket)
                            .key("uploads/" + name)
                            .build());

            String ct = obj.response().contentType();
            return ResponseEntity.ok()
                    .contentType(ct != null
                            ? MediaType.parseMediaType(ct)
                            : MediaType.APPLICATION_OCTET_STREAM)
                    .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
                    .body(obj.asByteArray());
        } catch (NoSuchKeyException e) {
            return ResponseEntity.notFound().build();
        }
    }
}