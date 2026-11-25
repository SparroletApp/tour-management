
package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.imageupload.ImageResultDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Service
public class PixabayService {

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

        Map<String, Object> body =
                restTemplate.getForObject(url, Map.class);

        if (body == null || body.get("hits") == null) {
            return List.of();
        }

        List<Map<String, Object>> hits =
                (List<Map<String, Object>>) body.get("hits");

        return hits.stream().map(h -> new ImageResultDto(
                ((Number) h.get("id")).longValue(),
                (String) h.get("webformatURL"),
                (String) h.get("largeImageURL"),
                (String) h.get("user"),
                (String) h.get("pageURL")
        )).toList();
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(PixabayService.class);

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

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                            + "(KHTML, like Gecko) Chrome/124.0 Safari/537.36");
            headers.set("Accept", "image/avif,image/webp,image/*,*/*;q=0.8");
            headers.set("Referer", "https://pixabay.com/");

            org.springframework.http.ResponseEntity<byte[]> response = restTemplate.exchange(
                    uri,
                    org.springframework.http.HttpMethod.GET,
                    new org.springframework.http.HttpEntity<>(headers),
                    byte[].class);

            byte[] bytes = response.getBody();

            if (bytes == null || bytes.length == 0) {
                throw new IllegalArgumentException("Downloaded image was empty");
            }
            return bytes;

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Pixabay download failed: {} for {}", e.getStatusCode(), uri, e);
            throw new IllegalArgumentException(
                    "Pixabay refused the download (HTTP " + e.getStatusCode().value() + ")");
        } catch (Exception e) {
            log.error("Pixabay download failed for {}", uri, e);
            throw new IllegalArgumentException(
                    "Unable to download selected image: " + e.getMessage());
        }
    }
}
