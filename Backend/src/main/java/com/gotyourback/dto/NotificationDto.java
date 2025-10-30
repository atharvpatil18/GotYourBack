package com.gotyourback.dto;

import com.gotyourback.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long recipientId;
    private String type;
    private String message;
    private Long relatedItemId;
    private Long relatedRequestId;
    private Long relatedMessageId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationDto fromEntity(Notification notification) {
        if (notification == null) {
            throw new IllegalArgumentException("Notification cannot be null");
        }
        
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipientId());
        dto.setType(notification.getType() != null ? notification.getType().name() : null);
        dto.setMessage(notification.getMessage());
        dto.setRelatedItemId(notification.getRelatedItemId());
        dto.setRelatedRequestId(notification.getRelatedRequestId());
        dto.setRelatedMessageId(notification.getRelatedMessageId());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        return dto;
    }
}
