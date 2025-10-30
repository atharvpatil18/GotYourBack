package com.gotyourback.service;

import com.gotyourback.dto.NotificationDto;
import com.gotyourback.model.Notification;

import java.util.List;

public interface NotificationService {
    
    NotificationDto createNotification(Long recipientId, Notification.NotificationType type, String message, 
                                      Long relatedItemId, Long relatedRequestId, Long relatedMessageId);
    
    List<NotificationDto> getNotificationsForUser(Long userId);
    
    List<NotificationDto> getUnreadNotificationsForUser(Long userId);
    
    Long getUnreadCount(Long userId);
    
    NotificationDto markAsRead(Long notificationId);
    
    NotificationDto markAsRead(Long notificationId, Long userId);
    
    void markAllAsRead(Long userId);
    
    void deleteNotification(Long notificationId);
    
    void deleteNotification(Long notificationId, Long userId);
}
