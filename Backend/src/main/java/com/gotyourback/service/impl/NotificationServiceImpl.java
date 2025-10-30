package com.gotyourback.service.impl;

import com.gotyourback.dto.NotificationDto;
import com.gotyourback.exception.NotificationNotFoundException;
import com.gotyourback.exception.UnauthorizedAccessException;
import com.gotyourback.model.Notification;
import com.gotyourback.repository.NotificationRepository;
import com.gotyourback.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationDto createNotification(Long recipientId, Notification.NotificationType type, 
                                            String message, Long relatedItemId, Long relatedRequestId, 
                                            Long relatedMessageId) {
        log.info("Creating notification for user {} - Type: {}, Message: {}", recipientId, type, message);
        
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRelatedItemId(relatedItemId);
        notification.setRelatedRequestId(relatedRequestId);
        notification.setRelatedMessageId(relatedMessageId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification saved = notificationRepository.save(notification);
        log.info("Notification created successfully with ID: {}", saved.getId());
        return NotificationDto.fromEntity(saved);
    }

    @Override
    public List<NotificationDto> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDto> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification updated = notificationRepository.save(notification);
        return NotificationDto.fromEntity(updated);
    }
    
    @Override
    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));
        
        if (!notification.getRecipientId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to modify this notification");
        }
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification updated = notificationRepository.save(notification);
        return NotificationDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false);
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));
        
        if (!notification.getRecipientId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this notification");
        }
        
        notificationRepository.deleteById(notificationId);
    }
}
