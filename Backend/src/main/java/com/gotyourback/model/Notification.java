package com.gotyourback.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_recipient_id", columnList = "recipientId"),
    @Index(name = "idx_is_read", columnList = "isRead"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column
    private Long relatedItemId;

    @Column
    private Long relatedRequestId;

    @Column
    private Long relatedMessageId;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime readAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    public enum NotificationType {
        REQUEST_CREATED,
        REQUEST_ACCEPTED,
        REQUEST_REJECTED,
        REQUEST_COMPLETED,
        MESSAGE_RECEIVED,
        ITEM_UPDATED,
        ITEM_DELETED,
        REQUEST_STATUS_CHANGED
    }
}
