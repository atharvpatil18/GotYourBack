package com.gotyourback.controller;

import com.gotyourback.dto.MessageDto;
import com.gotyourback.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @PostMapping("/send/{requestId}")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long requestId,
            @RequestParam Long senderId,
            @RequestBody String content) {
        return ResponseEntity.ok(messageService.sendMessage(senderId, requestId, content));
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<MessageDto>> getMessagesByRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(messageService.getMessagesByRequestId(requestId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MessageDto>> getUserMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUserMessages(userId));
    }
}