package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.userdto.*;

import java.util.List;

public interface UserService {

    AuthResponseDto createUser(CreateUserDto request);

    String sendPasswordOtp(SendPasswordOtpDto request);

    String verifyPasswordOtp(VerifyPasswordOtpDto request);

    AuthResponseDto login(LoginUserDto request);

    List<UserResponseDto> getUsersByCompanyId(CompanyIdDto request);

    UserResponseDto getUserById(UserIdDto request);

    UserResponseDto updateUser(UserUpdateDto request);

    String deleteUser(UserIdDto request);

    String resetPassword(ResetPasswordDto request);
}