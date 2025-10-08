package com.gotyourback.dto;

import com.gotyourback.model.Request.RequestStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RequestDto {
    private Long id;
    private Long itemId;
    private Long requesterId;
    private RequestStatus status;
    private String requesterName;
    private String requesterEmail;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private ItemDto item;
}