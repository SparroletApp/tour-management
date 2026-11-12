package com.example.tourmanagement.controller;

import com.example.tourmanagement.dto.userdto.AuthResponseDto;
import com.example.tourmanagement.dto.userdto.CreateUserDto;
import com.example.tourmanagement.dto.userdto.LoginUserDto;
import com.example.tourmanagement.service.UserService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginUserDto request) {

        return ResponseEntity.ok(userService.login(request));
    }
}