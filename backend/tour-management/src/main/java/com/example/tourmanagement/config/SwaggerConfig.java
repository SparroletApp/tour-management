
package com.example.tourmanagement.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        Server localServer = new Server()
                .url("http://localhost:8080")
                .description("Local Development Server");

        Server productionServer = new Server()
                .url("https://tmsapi.rayloop.com")
                .description("Production HTTPS Server");

        return new OpenAPI()
                .servers(List.of(localServer, productionServer))

                .info(new Info()
                        .title("Tour Management API")
                        .description("API documentation for Tour Management")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Rayloop Team")))

                .addSecurityItem(new SecurityRequirement()
                        .addList("Bearer Authentication"))

                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .name("Authorization")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
