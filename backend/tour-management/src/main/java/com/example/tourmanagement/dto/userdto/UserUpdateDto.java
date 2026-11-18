
package com.example.tourmanagement.dto.userdto;

import lombok.Data;

@Data
public class UserUpdateDto {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String role;

    private Boolean status;

    private Long companyId;
}
