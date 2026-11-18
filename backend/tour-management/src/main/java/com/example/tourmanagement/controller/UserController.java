package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.userdto.*;
import com.example.tourmanagement.service.UserService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(
            @Valid @RequestBody CreateUserDto request) {

        return ResponseEntity.ok(userService.createUser(request));
    }
    @PostMapping("/send-password-otp")
    public ResponseEntity<String> sendPasswordOtp(
            @RequestBody SendPasswordOtpDto request) {

        return ResponseEntity.ok(userService.sendPasswordOtp(request));
    }

    @PostMapping("/verify-password-otp")
    public ResponseEntity<String> verifyPasswordOtp(
            @RequestBody VerifyPasswordOtpDto request) {

        return ResponseEntity.ok(userService.verifyPasswordOtp(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordDto request) {

        return ResponseEntity.ok(userService.resetPassword(request));
    }


    @PostMapping("/delete")
    public ResponseEntity<String> deleteUser(
            @RequestBody UserIdDto request) {

        return ResponseEntity.ok(userService.deleteUser(request));
    }

    @PostMapping("/update")
    public ResponseEntity<UserResponseDto> updateUser(
            @RequestBody UserUpdateDto request) {

        return ResponseEntity.ok(userService.updateUser(request));
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginUserDto request) {

        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<UserResponseDto> getUserById(
            @Valid @RequestBody UserIdDto request) {

        return ResponseEntity.ok(userService.getUserById(request));
    }

    @PostMapping("/get-by-company")
    public ResponseEntity<List<UserResponseDto>> getUsersByCompany(
            @Valid @RequestBody CompanyIdDto request) {

        return ResponseEntity.ok(userService.getUsersByCompanyId(request));
    }
}