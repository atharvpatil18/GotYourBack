package com.gotyourback.repository;

import com.gotyourback.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByRequesterId(Long requesterId);
    List<Request> findByItem_OwnerId(Long ownerId);
    List<Request> findByItem_Id(Long itemId);
    Long countByRequesterIdAndStatusIn(Long requesterId, List<Request.RequestStatus> statuses);
    Long countByRequesterIdAndStatus(Long requesterId, Request.RequestStatus status);
    List<Request> findByRequesterIdAndStatus(Long requesterId, Request.RequestStatus status);
    List<Request> findByItem_OwnerIdAndStatus(Long ownerId, Request.RequestStatus status);
}