package com.gotyourback.service.impl;

import com.gotyourback.dto.ApiResponse;
import com.gotyourback.dto.LoginRequest;
import com.gotyourback.dto.LoginResponse;
import com.gotyourback.dto.SignupRequest;
import com.gotyourback.dto.ProfileDto;
import com.gotyourback.model.User;
import com.gotyourback.repository.UserRepository;
import com.gotyourback.repository.ItemRepository;
import com.gotyourback.repository.RequestRepository;
import com.gotyourback.service.UserService;
import com.gotyourback.model.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final RequestRepository requestRepository;

    @Override
    public ApiResponse<?> register(SignupRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse<>(false, "Email already registered", null);
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In a real app, you should hash the password

        userRepository.save(user);
        return new ApiResponse<>(true, "User registered successfully", null);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify password (in a real app, you should verify hashed passwords)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return LoginResponse.builder()
            .success(true)
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .message("User logged in successfully")
            .build();
    }

    @Override
    public ProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long totalListings = itemRepository.countByOwnerId(userId);
        Long activeRequests = requestRepository.countByRequesterIdAndStatusIn(userId, 
            java.util.List.of(Request.RequestStatus.PENDING, Request.RequestStatus.ACCEPTED));
        Long completedDeals = requestRepository.countByRequesterIdAndStatus(userId, Request.RequestStatus.DONE);

        ProfileDto profileDto = new ProfileDto();
        profileDto.setId(user.getId());
        profileDto.setName(user.getName());
        profileDto.setEmail(user.getEmail());
        profileDto.setDepartment(user.getDepartment());
        profileDto.setRegistrationNumber(user.getRegistrationNumber());
        profileDto.setYearOfStudy(user.getYearOfStudy());
        profileDto.setTotalListings(totalListings.intValue());
        profileDto.setActiveRequests(activeRequests.intValue());
        profileDto.setCompletedDeals(completedDeals.intValue());

        return profileDto;
    }

    @Override
    public ProfileDto updateProfile(Long userId, ProfileDto profileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(profileDto.getName());
        user.setDepartment(profileDto.getDepartment());
        user.setRegistrationNumber(profileDto.getRegistrationNumber());
        user.setYearOfStudy(profileDto.getYearOfStudy());

        user = userRepository.save(user);
        return getProfile(userId);
    }
}