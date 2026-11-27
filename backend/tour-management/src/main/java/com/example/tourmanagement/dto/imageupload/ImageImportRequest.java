
package com.example.tourmanagement.dto.imageupload;

import jakarta.validation.constraints.NotBlank;

public record ImageImportRequest(

        @NotBlank(message = "Image URL is required")
        String url,

        @NotBlank(message = "Download location is required")
        String downloadLocation

) {
}
