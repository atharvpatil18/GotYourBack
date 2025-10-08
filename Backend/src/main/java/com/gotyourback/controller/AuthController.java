package com.gotyourback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gotyourback.dto.ApiResponse;
import com.gotyourback.dto.LoginRequest;
import com.gotyourback.dto.LoginResponse;
import com.gotyourback.dto.SignupRequest;
import com.gotyourback.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<?>> signup(@RequestBody SignupRequest request) {
        try {
            if (!request.getEmail().endsWith("@srmist.edu.in")) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Please use your @srmist.edu.in email address", null));
            }
            ApiResponse<?> response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody LoginRequest request) {
        try {
            if (!request.getEmail().endsWith("@srmist.edu.in")) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Please use your @srmist.edu.in email address"));
            }
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
