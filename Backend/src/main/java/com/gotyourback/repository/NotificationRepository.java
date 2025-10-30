package com.gotyourback.repository;

import com.gotyourback.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    List<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(Long recipientId, Boolean isRead);
    
    Long countByRecipientIdAndIsRead(Long recipientId, Boolean isRead);
    
    void deleteByRecipientId(Long recipientId);
}
