package com.gotyourback.service;

import com.gotyourback.dto.MessageDto;
import com.gotyourback.model.Message;
import com.gotyourback.model.Request;
import com.gotyourback.model.User;
import com.gotyourback.model.Notification;
import com.gotyourback.repository.MessageRepository;
import com.gotyourback.repository.RequestRepository;
import com.gotyourback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public MessageDto sendMessage(Long senderId, Long requestId, String content) {
        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
            
        // Only allow messaging if request is accepted or done
        if (request.getStatus() != Request.RequestStatus.ACCEPTED && 
            request.getStatus() != Request.RequestStatus.DONE) {
            throw new RuntimeException("Cannot send messages for non-accepted requests");
        }
        
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
            
        // Determine receiver (if sender is requester, receiver is item owner, and vice versa)
        User receiver = sender.getId().equals(request.getRequester().getId()) 
            ? request.getItem().getOwner() 
            : request.getRequester();

        Message message = new Message();
        message.setRequest(request);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        
        message = messageRepository.save(message);
        
        // Create notification for receiver
        notificationService.createNotification(
            receiver.getId(),
            Notification.NotificationType.MESSAGE_RECEIVED,
            "New message from " + sender.getName() + " about '" + request.getItem().getName() + "'",
            request.getItem().getId(),
            request.getId(),
            message.getId()
        );
        
        return convertToDto(message);
    }

    public List<MessageDto> getMessagesByRequestId(Long requestId) {
        List<Message> messages = messageRepository.findByRequestId(requestId);
        return messages.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<MessageDto> getUserMessages(Long userId) {
        List<Message> messages = messageRepository.findByUserId(userId);
        return messages.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    private MessageDto convertToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setRequestId(message.getRequest().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getName());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        return dto;
    }
}