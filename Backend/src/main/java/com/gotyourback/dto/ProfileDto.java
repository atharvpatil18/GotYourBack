package com.gotyourback.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String registrationNumber;
    private Integer yearOfStudy;
    private int totalListings;
    private int activeRequests;
    private int completedDeals;
}