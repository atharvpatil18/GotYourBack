package com.gotyourback.dto;

import com.gotyourback.model.Item.ItemType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ItemDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private ItemType type;
    private String urgency;
    private String imageUrl;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String buyerName;  // For sold items
    private String buyerEmail; // For sold items
    private String borrowerName;  // For lent items
    private String borrowerEmail; // For lent items
    private String status; // Item status (AVAILABLE, SOLD, RETURNED, UNAVAILABLE)
    private Boolean isReturned; // For lent items - true if both parties confirmed return
    private LocalDateTime lentAt; // When item was lent
    private LocalDateTime completedAt; // When return was completed
}