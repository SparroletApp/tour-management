package com.example.tourmanagement.dto.userdto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyPasswordOtpDto {
    private String email;
    private String otp;
}