package com.example.tourmanagement.service.impl;

import com.example.tourmanagement.dto.companydto.CompanyIdDto;
import com.example.tourmanagement.dto.userdto.*;

import com.example.tourmanagement.entity.User;
import com.example.tourmanagement.entity.CompanyEntity;

import com.example.tourmanagement.repository.UserRepository;
import com.example.tourmanagement.repository.CompanyRepository;

import com.example.tourmanagement.service.JwtService;
import com.example.tourmanagement.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public AuthResponseDto createUser(CreateUserDto request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        CompanyEntity company = null;

        if (request.getCompanyId() != null && request.getCompanyId() > 0) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
        }

        if (request.getRole() == null ||
                (!request.getRole().trim().equalsIgnoreCase("ADMIN") &&
                        !request.getRole().trim().equalsIgnoreCase("MANAGER") &&
                        !request.getRole().trim().equalsIgnoreCase("STAFF"))) {

            throw new RuntimeException(
                    "Invalid role. Allowed roles: ADMIN, MANAGER, STAFF"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole().trim().toUpperCase());
        user.setStatus(true);
        user.setCompany(company);

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser, null, "Registration successful");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginUserDto request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getStatus())) {
            throw new RuntimeException("Your account is inactive");
        }

        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return buildAuthResponse(user, token, "Login successful");
    }


    @Override
    public String sendPasswordOtp(SendPasswordOtpDto request) {

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.format("%06d",
                secureRandom.nextInt(1000000));

        user.setOtp(otp);
        user.setOtp_verify(false);
        user.setOtp_expiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(user.getEmail());
            message.setSubject("Tour Management - Password Reset OTP");

            message.setText(
                    "Hello " + user.getName() + ",\n\n" +
                            "Your password reset OTP is: " + otp + "\n\n" +
                            "This OTP is valid for 10 minutes.\n\n" +
                            "If you did not request this, please ignore this email.\n\n" +
                            "Regards,\n" +
                            "Tour Management Team"
            );

            mailSender.send(message);

            return "Password reset OTP sent to your email";

        } catch (org.springframework.mail.MailAuthenticationException e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Gmail authentication failed. Please check your SMTP username and App Password."
            );

        } catch (org.springframework.mail.MailException e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to send OTP email. Please check your mail configuration."
            );
        }
    }


    @Override
    public String verifyPasswordOtp(VerifyPasswordOtpDto request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || user.getOtp_expiry() == null) {
            throw new RuntimeException("OTP not found. Please request a new OTP");
        }

        if (LocalDateTime.now().isAfter(user.getOtp_expiry())) {
            throw new RuntimeException("OTP expired. Please request a new OTP");
        }

        if (request.getOtp() == null ||
                !user.getOtp().equals(request.getOtp().trim())) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setOtp_verify(true);
        userRepository.save(user);

        return "OTP verified successfully";
    }

    @Override
    public String resetPassword(ResetPasswordDto request) {

        if (request.getNewPassword() == null ||
                !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getOtp_verify())) {
            throw new RuntimeException("Please verify the OTP before resetting your password");
        }

        if (user.getOtp_expiry() == null ||
                LocalDateTime.now().isAfter(user.getOtp_expiry())) {
            throw new RuntimeException("OTP expired. Please request a new OTP");
        }

        user.setPassword(request.getNewPassword());

        user.setOtp(null);
        user.setOtp_verify(false);
        user.setOtp_expiry(null);

        userRepository.save(user);

        return "Password reset successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDto> getUsersByCompanyId(CompanyIdDto request) {

        if (!companyRepository.existsById(request.getId())) {
            throw new RuntimeException("Company not found");
        }

        return userRepository.findByCompany_Id(request.getId())
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(UserIdDto request) {

        User user = userRepository.findById(request.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + request.getId()));

        return mapToUserResponse(user);
    }

    @Override
    public UserResponseDto updateUser(UserUpdateDto request) {

        User user = userRepository.findById(request.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + request.getId()));

        if (request.getEmail() != null &&
                !request.getEmail().equalsIgnoreCase(user.getEmail())) {

            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }

            user.setEmail(request.getEmail());
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getRole() != null) {

            String role = request.getRole().trim().toUpperCase();

            if (!role.equals("MANAGER") && !role.equals("STAFF")) {
                throw new RuntimeException("Invalid role. Allowed roles: MANAGER, STAFF");
            }

            user.setRole(role);
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getCompanyId() != null) {

            CompanyEntity company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            user.setCompany(company);
        }

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public String deleteUser(UserIdDto request) {

        User user = userRepository.findById(request.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + request.getId()));

        userRepository.delete(user);

        return "User deleted successfully";
    }

    private UserResponseDto mapToUserResponse(User user) {

        UserResponseDto userResponse = new UserResponseDto();

        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPhone(user.getPhone());
        userResponse.setRole(user.getRole());
        userResponse.setStatus(user.getStatus());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setPassword(user.getPassword());

        if (user.getCompany() != null) {
            userResponse.setCompanyId(user.getCompany().getId());
            userResponse.setCompanyName(user.getCompany().getCompanyName());
        }

        return userResponse;
    }

    private AuthResponseDto buildAuthResponse(User user, String token, String message) {

        AuthResponseDto response = new AuthResponseDto();

        response.setMessage(message);
        response.setToken(token);
        response.setUser(mapToUserResponse(user));

        return response;
    }
}