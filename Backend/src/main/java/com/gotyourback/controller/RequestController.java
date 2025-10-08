package com.gotyourback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gotyourback.dto.RequestDto;
import com.gotyourback.model.Request.RequestStatus;
import com.gotyourback.service.RequestService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:8081", "http://localhost:8081"}, allowCredentials = "true")
public class RequestController {

    private final RequestService requestService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RequestDto>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getRequestsByRequesterId(userId));
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<RequestDto>> getReceivedRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getReceivedRequests(userId));
    }

    @GetMapping("/user/{userId}/accepted")
    public ResponseEntity<List<RequestDto>> getAcceptedRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getAcceptedRequestsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<RequestDto> createRequest(@RequestBody RequestDto request) {
        return ResponseEntity.ok(requestService.createRequest(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RequestDto> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {
        return ResponseEntity.ok(requestService.updateRequestStatus(id, status));
    }

    @PutMapping("/{id}/done")
    public ResponseEntity<RequestDto> markRequestAsDone(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.markRequestAsDone(id));
    }
}