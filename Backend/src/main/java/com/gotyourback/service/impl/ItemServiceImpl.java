package com.gotyourback.service.impl;

import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Item;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.model.Item.ItemType;
import com.gotyourback.model.User;
import com.gotyourback.repository.ItemRepository;
import com.gotyourback.repository.UserRepository;
import com.gotyourback.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

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

        item = itemRepository.save(item);
        return convertToDto(item);
    }

    @Override
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
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
        List<Item> items = itemRepository.findByOwnerId(ownerId);
        return items.stream()
                .map(this::convertToDto)
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
}