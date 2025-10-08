package com.gotyourback.repository;

import com.gotyourback.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE m.request.id = :requestId ORDER BY m.sentAt DESC")
    List<Message> findByRequestId(@Param("requestId") Long requestId);
    
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) ORDER BY m.sentAt DESC")
    List<Message> findByUserId(@Param("userId") Long userId);
}