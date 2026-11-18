package com.example.tourmanagement.dto.userdto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserIdDto {

    @NotNull(message = "User ID is required")
    private Long id;
}