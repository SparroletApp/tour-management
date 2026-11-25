package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.imageupload.ImageResultDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PixabayService {

    private static final Logger log = LoggerFactory.getLogger(PixabayService.class);

    @Value("${pixabay.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable(value = "pixabay", key = "#query + '-' + #page")
    @SuppressWarnings("unchecked")
    public List<ImageResultDto> search(String query, int page) {

        String url = UriComponentsBuilder
                .fromUriString("https://pixabay.com/api/")
                .queryParam("key", apiKey)
                .queryParam("q", query)
                .queryParam("image_type", "photo")
                .queryParam("orientation", "horizontal")
                .queryParam("safesearch", true)
                .queryParam("per_page", 18)
                .queryParam("page", page)
                .build()
                .encode()
                .toUriString();

        Map<String, Object> body = restTemplate.getForObject(url, Map.class);

        if (body == null || body.get("hits") == null) {
            return List.of();
        }

        List<Map<String, Object>> hits = (List<Map<String, Object>>) body.get("hits");

        return hits.stream().map(h -> {
            String preview = (String) h.get("previewURL");   // https://cdn.pixabay.com/photo/.../name_150.jpg
            String full = (preview != null && preview.contains("_150"))
                    ? preview.replace("_150", "_640")         // same CDN path, 640px
                    : (String) h.get("webformatURL");         // fallback

            return new ImageResultDto(
                    ((Number) h.get("id")).longValue(),
                    preview,                                  // grid thumbnail
                    full,                                     // image that gets imported
                    (String) h.get("user"),
                    (String) h.get("pageURL"));
        }).toList();
    }

    public byte[] download(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("Image URL is required");
        }

        URI uri = URI.create(imageUrl.trim());
        String host = uri.getHost();

        boolean validHost = host != null &&
                (host.equalsIgnoreCase("pixabay.com") ||
                        host.toLowerCase(Locale.ROOT).endsWith(".pixabay.com"));

        if (!"https".equalsIgnoreCase(uri.getScheme())
                || !validHost
                || uri.getUserInfo() != null
                || uri.getPort() != -1) {
            throw new IllegalArgumentException("Invalid image source");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        + "(KHTML, like Gecko) Chrome/124.0 Safari/537.36");
        headers.set("Accept", "image/avif,image/webp,image/*,*/*;q=0.8");
        headers.set("Referer", "https://pixabay.com/");

        try {
            for (int attempt = 1; attempt <= 3; attempt++) {
                try {
                    byte[] bytes = restTemplate.exchange(
                            uri, HttpMethod.GET, new HttpEntity<>(headers), byte[].class
                    ).getBody();

                    if (bytes == null || bytes.length == 0) {
                        throw new IllegalArgumentException("Downloaded image was empty");
                    }
                    return bytes;

                } catch (HttpStatusCodeException e) {
                    if (e.getStatusCode().value() == 429 && attempt < 3) {
                        log.warn("Pixabay 429, retry {} for {}", attempt, uri);
                        sleep(2000L * attempt);
                        continue;
                    }
                    throw e;
                }
            }
            throw new IllegalArgumentException("Unable to download selected image");

        } catch (HttpStatusCodeException e) {
            log.error("Pixabay download failed: {} for {}", e.getStatusCode(), uri);
            throw new IllegalArgumentException(
                    "Pixabay refused the download (HTTP " + e.getStatusCode().value() + ")");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Pixabay download failed for {}", uri, e);
            throw new IllegalArgumentException(
                    "Unable to download selected image: " + e.getMessage());
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