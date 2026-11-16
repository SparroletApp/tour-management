
package com.example.tourmanagement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ApiServerConfig {

    @Bean
    public OpenAPI apiServerOpenAPI() {

        Server server = new Server();
        server.setUrl("https://tmsapi.rayloop.com");
        server.setDescription("Production HTTPS Server");

        return new OpenAPI()
                .servers(List.of(server));
    }
}
