package com.gotyourback.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String password;
    
    private String department;
    
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @OneToMany(mappedBy = "owner")
    private List<Item> items = new ArrayList<>();

    @OneToMany(mappedBy = "requester")
    private List<Request> requests = new ArrayList<>();
}