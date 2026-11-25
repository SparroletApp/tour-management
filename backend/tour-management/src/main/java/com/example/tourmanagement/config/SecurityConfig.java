
package com.example.tourmanagement.config;

import jakarta.servlet.DispatcherType;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CorsConfigurationSource corsConfigurationSource) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                // CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF
                .csrf(AbstractHttpConfigurer::disable)

                // Stateless authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        .requestMatchers(
                                "/error",
                                "/api/user/register",
                                "/api/user/login",
                                "/public/media/**",
                                "/api/forms/**",
                                "/api/tours/**",
                                "/uploads/**",
                                "/api/tours/public/**",
                                "/api/answers/submit",
                                "/api/form-sections/get-by-form",
                                "/swagger-ui/**",
                                "/api/user/send-password-otp",
                                "/api/user/verify-password-otp",
                                "/api/user/reset-password",
                                "/api/questions/get-by-section",
                                "/api/form-submissions/create",
                                "/swagger-ui.html",
                                "/tour-media/tours/**",
                                "/api/form-builder/get-published-by-tour-code",
                                "/v3/api-docs/**",
                                "/api/webhook/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint((request, response, ex) -> {

                            response.setStatus(HttpStatus.UNAUTHORIZED.value());

                            response.setContentType(
                                    MediaType.APPLICATION_JSON_VALUE
                            );

                            response.getWriter().write(
                                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Please login. Authentication token is missing or invalid.\"}"
                            );
                        })

                        .accessDeniedHandler((request, response, ex) -> {

                            response.setStatus(HttpStatus.FORBIDDEN.value());

                            response.setContentType(
                                    MediaType.APPLICATION_JSON_VALUE
                            );

                            response.getWriter().write(
                                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"You do not have permission to access this resource.\"}"
                            );
                        })
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
