package com.example.tourmanagement.service;

import com.example.tourmanagement.dto.userdto.AuthResponseDto;
import com.example.tourmanagement.dto.userdto.CreateUserDto;
import com.example.tourmanagement.dto.userdto.LoginUserDto;

public interface UserService {
    AuthResponseDto createUser(CreateUserDto request);
    AuthResponseDto login(LoginUserDto request);

}