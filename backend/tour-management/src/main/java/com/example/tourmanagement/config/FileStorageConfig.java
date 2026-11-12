
package com.example.tourmanagement.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileStorageConfig {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Bean
    public Path fileUploadPath() {

        try {
            Path path = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(path);

            return path;

        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory", e
            );
        }
    }
}
