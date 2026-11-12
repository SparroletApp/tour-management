
package com.example.tourmanagement.dto.userdto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {

    private String message;

    private String token;

    private UserResponseDto user;
}
