
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.imageupload.ImageResultDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PexelsService {

    private static final Logger log =
            LoggerFactory.getLogger(PexelsService.class);

    @Value("${pexels.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable(value = "pexels", key = "#query + '-' + #page")
    @SuppressWarnings("unchecked")
    public List<ImageResultDto> search(String query, int page) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        if (page < 1) {
            page = 1;
        }

        String url = UriComponentsBuilder
                .fromUriString("https://api.pexels.com/v1/search")
                .queryParam("query", query)
                .queryParam("orientation", "landscape")
                .queryParam("per_page", 18)
                .queryParam("page", page)
                .build()
                .encode()
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        Map<String, Object> body = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
        ).getBody();

        if (body == null || body.get("photos") == null) {
            return List.of();
        }

        List<Map<String, Object>> photos =
                (List<Map<String, Object>>) body.get("photos");

        return photos.stream().map(photo -> {

            Number id = (Number) photo.get("id");

            Map<String, Object> src =
                    (Map<String, Object>) photo.get("src");

            String preview = (String) src.get("medium");

            String full = (String) src.get("large2x");

            if (full == null) {
                full = (String) src.get("original");
            }

            String photographer =
                    (String) photo.get("photographer");

            String pageUrl =
                    (String) photo.get("url");

            return new ImageResultDto(
                    id.longValue(),
                    preview,
                    full,
                    photographer,
                    pageUrl
            );

        }).toList();
    }

    public byte[] download(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "Image URL is required"
            );
        }

        URI uri = URI.create(imageUrl.trim());

        String host = uri.getHost();

        boolean validHost = host != null &&
                (host.equalsIgnoreCase("pexels.com") ||
                        host.toLowerCase(Locale.ROOT).endsWith(".pexels.com"));

        if (!"https".equalsIgnoreCase(uri.getScheme())
                || !validHost
                || uri.getUserInfo() != null
                || uri.getPort() != -1) {

            throw new IllegalArgumentException(
                    "Invalid image source"
            );
        }

        HttpHeaders headers = new HttpHeaders();

        headers.set("User-Agent", "Mozilla/5.0");
        headers.setAccept(List.of(MediaType.ALL));

        try {

            for (int attempt = 1; attempt <= 3; attempt++) {

                try {

                    byte[] bytes = restTemplate.exchange(
                            uri,
                            HttpMethod.GET,
                            new HttpEntity<>(headers),
                            byte[].class
                    ).getBody();

                    if (bytes == null || bytes.length == 0) {
                        throw new IllegalArgumentException(
                                "Downloaded image was empty"
                        );
                    }

                    return bytes;

                } catch (HttpStatusCodeException e) {

                    if (e.getStatusCode().value() == 429
                            && attempt < 3) {

                        log.warn(
                                "Pexels 429, retry {} for {}",
                                attempt,
                                uri
                        );

                        sleep(2000L * attempt);
                        continue;
                    }

                    throw e;
                }
            }

            throw new IllegalArgumentException(
                    "Unable to download selected image"
            );

        } catch (HttpStatusCodeException e) {

            log.error(
                    "Pexels download failed: {} for {}",
                    e.getStatusCode(),
                    uri
            );

            throw new IllegalArgumentException(
                    "Pexels refused the download (HTTP "
                            + e.getStatusCode().value() + ")"
            );

        } catch (IllegalArgumentException e) {
            throw e;

        } catch (Exception e) {

            log.error("Pexels download failed for {}", uri, e);

            throw new IllegalArgumentException(
                    "Unable to download selected image: "
                            + e.getMessage()
            );
        }
    }

    private void sleep(long ms) {

        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
