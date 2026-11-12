
package com.example.tourmanagement.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        try {
            Path uploadPath = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(uploadPath);

            String location = uploadPath.toUri().toString();

            if (!location.endsWith("/")) {
                location += "/";
            }

            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(location);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not configure image upload directory", e
            );
        }
    }
}
