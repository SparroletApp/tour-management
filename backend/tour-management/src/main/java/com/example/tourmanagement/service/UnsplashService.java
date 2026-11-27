
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.imageupload.ImageResultDto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class UnsplashService {

    private static final Logger log =
            LoggerFactory.getLogger(UnsplashService.class);

    private static final String API_URL =
            "https://api.unsplash.com";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${unsplash.access-key}")
    private String accessKey;

    private HttpHeaders createHeaders() {

        if (accessKey == null || accessKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Unsplash API access key is not configured"
            );
        }

        HttpHeaders headers = new HttpHeaders();

        headers.set(
                "Authorization",
                "Client-ID " + accessKey.trim()
        );

        headers.set("Accept-Version", "v1");

        headers.setAccept(
                List.of(MediaType.APPLICATION_JSON)
        );

        return headers;
    }

    // Search photos using Unsplash
    @Cacheable(
            value = "unsplash",
            key = "#query + '-' + #page"
    )
    public List<ImageResultDto> search(
            String query,
            int page) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        page = Math.max(page, 1);

        String url = UriComponentsBuilder
                .fromUriString(API_URL + "/search/photos")
                .queryParam("query", query.trim())
                .queryParam("page", page)
                .queryParam("per_page", 18)
                .queryParam("orientation", "landscape")
                .queryParam("content_filter", "high")
                .build()
                .encode()
                .toUriString();

        try {

            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            new HttpEntity<>(createHeaders()),
                            new ParameterizedTypeReference<>() {}
                    );

            Map<String, Object> body = response.getBody();

            if (body == null || body.get("results") == null) {
                return List.of();
            }

            List<?> results = (List<?>) body.get("results");

            List<ImageResultDto> images = new ArrayList<>();

            for (Object item : results) {

                if (!(item instanceof Map<?, ?> photo)) {
                    continue;
                }

                Object urlsObject = photo.get("urls");
                Object linksObject = photo.get("links");
                Object userObject = photo.get("user");

                if (!(urlsObject instanceof Map<?, ?> urls)
                        || !(linksObject instanceof Map<?, ?> links)
                        || !(userObject instanceof Map<?, ?> user)) {
                    continue;
                }

                String id = stringValue(photo.get("id"));

                String preview =
                        stringValue(urls.get("small"));

                String full =
                        stringValue(urls.get("regular"));

                String photographer =
                        stringValue(user.get("name"));

                String pageUrl =
                        stringValue(links.get("html"));

                String photographerUrl = null;

                Object profileObject = user.get("links");

                if (profileObject instanceof Map<?, ?> profile) {
                    photographerUrl =
                            stringValue(profile.get("html"));
                }

                String downloadLocation =
                        stringValue(links.get("download_location"));

                if (id == null
                        || preview == null
                        || full == null
                        || pageUrl == null
                        || downloadLocation == null) {
                    continue;
                }

                images.add(
                        new ImageResultDto(
                                id,
                                preview,
                                full,
                                photographer,
                                pageUrl,
                                photographerUrl,
                                downloadLocation
                        )
                );
            }

            return images;

        } catch (HttpStatusCodeException e) {

            log.error(
                    "Unsplash search failed. Status: {}",
                    e.getStatusCode()
            );

            if (e.getStatusCode().value() == 401) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Unsplash rejected the API access key."
                );
            }

            if (e.getStatusCode().value() == 403) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Unsplash API access is forbidden. Check application permissions."
                );
            }

            if (e.getStatusCode().value() == 429) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Unsplash API rate limit exceeded."
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unsplash image search is unavailable."
            );

        } catch (ResponseStatusException e) {
            throw e;

        } catch (Exception e) {

            log.error("Unsplash search error", e);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to search images using Unsplash."
            );
        }
    }

    // Track image selection as required by Unsplash
    public void trackDownload(String downloadLocation) {

        if (downloadLocation == null
                || downloadLocation.isBlank()) {

            throw new IllegalArgumentException(
                    "Unsplash download location is required"
            );
        }

        URI uri;

        try {
            uri = URI.create(downloadLocation.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Invalid Unsplash download location"
            );
        }

        boolean valid =
                "https".equalsIgnoreCase(uri.getScheme())
                        && "api.unsplash.com".equalsIgnoreCase(uri.getHost())
                        && uri.getUserInfo() == null
                        && uri.getPort() == -1
                        && uri.getPath() != null
                        && uri.getPath().matches(
                        "^/photos/[A-Za-z0-9_-]+/download/?$"
                );

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid Unsplash download location"
            );
        }

        try {

            restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Map.class
            );

            log.info("Unsplash download event tracked successfully");

        } catch (HttpStatusCodeException e) {

            log.error(
                    "Unsplash download tracking failed: {}",
                    e.getStatusCode()
            );

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not track Unsplash image selection."
            );
        }
    }

    private String stringValue(Object value) {

        return value == null
                ? null
                : value.toString();
    }
}
