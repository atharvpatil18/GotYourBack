package com.gotyourback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gotyourback.dto.ApiResponse;
import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Item.ItemType;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.service.ItemService;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<ItemDto>> getItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String urgency,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(itemService.getAllItems(category, type, urgency, keyword));
    }

    @PostMapping
    public ResponseEntity<ItemDto> createItem(@RequestBody ItemDto item) {
        return ResponseEntity.ok(itemService.createItem(item));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDto> updateItem(@PathVariable Long id, @RequestBody ItemDto item) {
        return ResponseEntity.ok(itemService.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateItemStatus(
            @PathVariable Long id,
            @RequestParam ItemStatus status) {
        itemService.updateItemStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Item status updated successfully"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemDto>> getUserItems(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getItemsByOwnerId(userId));
    }
    
    @GetMapping("/user/{userId}/sold")
    public ResponseEntity<List<ItemDto>> getUserSoldItems(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getSoldItemsByOwnerId(userId));
    }
    
    @GetMapping("/user/{userId}/lent")
    public ResponseEntity<List<ItemDto>> getUserLentItems(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.getLentItemsByOwnerId(userId));
    }
}