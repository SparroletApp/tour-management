package com.example.tourmanagement.dto.userdto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponseDto {

    private Long id;

    private String name;

    private String email;

    private Long companyId;

    private String companyName;

    private String phone;

    private String role;
    private String password;
    private Boolean status;

    private LocalDateTime createdAt;
}