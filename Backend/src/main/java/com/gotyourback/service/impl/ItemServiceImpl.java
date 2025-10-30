package com.gotyourback.service.impl;

import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Item;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.model.Item.ItemType;
import com.gotyourback.model.User;
import com.gotyourback.model.Notification;
import com.gotyourback.repository.ItemRepository;
import com.gotyourback.repository.UserRepository;
import com.gotyourback.repository.RequestRepository;
import com.gotyourback.service.ItemService;
import com.gotyourback.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RequestRepository requestRepository;

    @Override
    public ItemDto createItem(ItemDto itemDto) {
        // Validate required fields
        if (itemDto.getName() == null || itemDto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (itemDto.getDescription() == null || itemDto.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (itemDto.getCategory() == null || itemDto.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (itemDto.getType() == null) {
            throw new IllegalArgumentException("Type is required");
        }
        if (itemDto.getOwnerId() == null) {
            throw new IllegalArgumentException("Owner ID is required");
        }

        User owner = userRepository.findById(itemDto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Item item = new Item();
        item.setName(itemDto.getName().trim());
        item.setDescription(itemDto.getDescription().trim());
        item.setCategory(itemDto.getCategory());
        item.setType(itemDto.getType());
        item.setUrgency(itemDto.getUrgency() != null ? itemDto.getUrgency() : "NORMAL");
        item.setImageUrl(itemDto.getImageUrl());
        item.setOwner(owner);
        item.setStatus(ItemStatus.AVAILABLE);

        item = itemRepository.save(item);
        itemDto.setId(item.getId());
        return itemDto;
    }

    @Override
    public ItemDto getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return convertToDto(item);
    }

    @Override
    public List<ItemDto> getAllItems(String category, ItemType type, String urgency, String keyword) {
        List<Item> items = itemRepository.searchItems(category, type, urgency, keyword);
        return items.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ItemDto updateItem(Long id, ItemDto itemDto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getOwner().getId().equals(itemDto.getOwnerId())) {
            throw new RuntimeException("Only the owner can update this item");
        }

        item.setName(itemDto.getName());
        item.setDescription(itemDto.getDescription());
        item.setCategory(itemDto.getCategory());
        item.setType(itemDto.getType());
        item.setUrgency(itemDto.getUrgency());
        item.setImageUrl(itemDto.getImageUrl());

        Item savedItem = itemRepository.save(item);
        
        // Notify users who have pending/accepted requests for this item
        requestRepository.findByItem_Id(id).forEach(request -> {
            if (request.getStatus() == com.gotyourback.model.Request.RequestStatus.PENDING || 
                request.getStatus() == com.gotyourback.model.Request.RequestStatus.ACCEPTED) {
                notificationService.createNotification(
                    request.getRequester().getId(),
                    Notification.NotificationType.ITEM_UPDATED,
                    "Item '" + savedItem.getName() + "' has been updated by the owner",
                    savedItem.getId(),
                    request.getId(),
                    null
                );
            }
        });
        
        return convertToDto(savedItem);
    }

    @Override
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        // Notify users who have pending/accepted requests for this item
        requestRepository.findByItem_Id(id).forEach(request -> {
            if (request.getStatus() == com.gotyourback.model.Request.RequestStatus.PENDING || 
                request.getStatus() == com.gotyourback.model.Request.RequestStatus.ACCEPTED) {
                notificationService.createNotification(
                    request.getRequester().getId(),
                    Notification.NotificationType.ITEM_DELETED,
                    "Item '" + item.getName() + "' has been deleted by the owner",
                    null,
                    request.getId(),
                    null
                );
            }
        });
        
        itemRepository.delete(item);
    }

    @Override
    public void updateItemStatus(Long id, ItemStatus status) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(status);
        itemRepository.save(item);
    }

    @Override
    public List<ItemDto> getItemsByOwnerId(Long ownerId) {
        List<Item> items = itemRepository.findActiveByOwnerId(ownerId);
        return items.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ItemDto> getSoldItemsByOwnerId(Long ownerId) {
        List<Item> items = itemRepository.findSoldByOwnerId(ownerId);
        return items.stream()
                .map(this::convertToSoldItemDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ItemDto> getLentItemsByOwnerId(Long ownerId) {
        List<Item> items = itemRepository.findLentByOwnerId(ownerId);
        return items.stream()
                .map(this::convertToLentItemDto)
                .collect(Collectors.toList());
    }

    private ItemDto convertToDto(Item item) {
    ItemDto dto = new ItemDto();
    dto.setId(item.getId());
    dto.setName(item.getName());
    dto.setDescription(item.getDescription());
    dto.setCategory(item.getCategory());
    dto.setType(item.getType());
    dto.setUrgency(item.getUrgency());
    dto.setImageUrl(item.getImageUrl());
    dto.setOwnerId(item.getOwner().getId());
    dto.setOwnerName(item.getOwner().getName());
    dto.setOwnerEmail(item.getOwner().getEmail());
    return dto;
    }

    private ItemDto convertToSoldItemDto(Item item) {
        ItemDto dto = convertToDto(item);
        
        // Find the accepted/done request for this item to get buyer information
        requestRepository.findByItem_Id(item.getId()).stream()
                .filter(request -> request.getStatus() == com.gotyourback.model.Request.RequestStatus.DONE)
                .findFirst()
                .ifPresent(request -> {
                    dto.setBuyerName(request.getRequester().getName());
                    dto.setBuyerEmail(request.getRequester().getEmail());
                });
        
        return dto;
    }
    
    private ItemDto convertToLentItemDto(Item item) {
        ItemDto dto = convertToDto(item);
        dto.setStatus(item.getStatus().toString());
        
        // Find the accepted/done request for this item to get borrower information
        requestRepository.findByItem_Id(item.getId()).stream()
                .filter(request -> request.getStatus() == com.gotyourback.model.Request.RequestStatus.ACCEPTED 
                                || request.getStatus() == com.gotyourback.model.Request.RequestStatus.DONE)
                .findFirst()
                .ifPresent(request -> {
                    dto.setBorrowerName(request.getRequester().getName());
                    dto.setBorrowerEmail(request.getRequester().getEmail());
                    dto.setLentAt(request.getLentAt());
                    dto.setCompletedAt(request.getCompletedAt());
                    
                    // Check if item has been returned (both parties confirmed)
                    Boolean borrowerConfirmed = request.getBorrowerConfirmedReturn() != null && request.getBorrowerConfirmedReturn();
                    Boolean lenderConfirmed = request.getLenderConfirmedReturn() != null && request.getLenderConfirmedReturn();
                    dto.setIsReturned(borrowerConfirmed && lenderConfirmed);
                });
        
        return dto;
    }
}