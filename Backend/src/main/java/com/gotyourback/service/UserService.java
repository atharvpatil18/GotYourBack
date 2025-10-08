package com.gotyourback.service;

import com.gotyourback.dto.ApiResponse;
import com.gotyourback.dto.LoginRequest;
import com.gotyourback.dto.LoginResponse;
import com.gotyourback.dto.SignupRequest;
import com.gotyourback.dto.ProfileDto;

public interface UserService {
    ApiResponse<?> register(SignupRequest request);
    LoginResponse login(LoginRequest request);
    ProfileDto getProfile(Long userId);
    ProfileDto updateProfile(Long userId, ProfileDto profileDto);
}