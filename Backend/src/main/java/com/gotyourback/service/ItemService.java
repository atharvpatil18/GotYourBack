package com.gotyourback.service;

import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.model.Item.ItemType;
import java.util.List;

public interface ItemService {
    ItemDto createItem(ItemDto itemDto);
    
    ItemDto getItemById(Long id);
    
    List<ItemDto> getAllItems(String category, ItemType type, String urgency, String keyword);
    
    ItemDto updateItem(Long id, ItemDto itemDto);
    
    void deleteItem(Long id);
    
    void updateItemStatus(Long id, ItemStatus status);
    
    List<ItemDto> getItemsByOwnerId(Long ownerId);
}