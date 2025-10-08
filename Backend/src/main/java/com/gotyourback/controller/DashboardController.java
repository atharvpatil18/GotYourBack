package com.gotyourback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gotyourback.dto.RequestDto;
import com.gotyourback.service.RequestService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard/users")
@RequiredArgsConstructor
public class DashboardController {

    private final RequestService requestService;

    @GetMapping("/{userId}/requests")
    public ResponseEntity<List<RequestDto>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getRequestsByRequesterId(userId));
    }

    @GetMapping("/{userId}/received-requests")
    public ResponseEntity<List<RequestDto>> getReceivedRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getReceivedRequests(userId));
    }
}