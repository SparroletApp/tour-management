
package com.example.tourmanagement.dto.imageupload;

public record ImageResultDto(
        String id,
        String preview,
        String full,
        String photographer,
        String pageUrl,
        String photographerUrl,
        String downloadLocation
) {
}
