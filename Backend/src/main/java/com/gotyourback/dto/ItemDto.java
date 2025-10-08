package com.gotyourback.dto;

import com.gotyourback.model.Item.ItemType;
import lombok.Data;

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
}