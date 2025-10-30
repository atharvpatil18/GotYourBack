package com.gotyourback.repository;

import com.gotyourback.model.Item;
import com.gotyourback.model.Item.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long ownerId);
    
    // Get active items (not sold) for owner
    @Query("SELECT i FROM Item i WHERE i.owner.id = :ownerId AND i.status != 'SOLD'")
    List<Item> findActiveByOwnerId(Long ownerId);
    
    // Get sold items for owner
    @Query("SELECT i FROM Item i WHERE i.owner.id = :ownerId AND i.status = 'SOLD'")
    List<Item> findSoldByOwnerId(Long ownerId);
    
    // Get lent items for owner (currently lent or returned)
    @Query("SELECT i FROM Item i WHERE i.owner.id = :ownerId AND i.type = 'LEND' AND i.status IN ('UNAVAILABLE', 'RETURNED')")
    List<Item> findLentByOwnerId(Long ownerId);
    
    Long countByOwnerId(Long ownerId);
    
    @Query("SELECT i FROM Item i WHERE " +
           "(:category is null or i.category = :category) and " +
           "(:type is null or i.type = :type) and " +
           "(:urgency is null or i.urgency = :urgency) and " +
           "(:keyword is null or lower(i.name) like lower(concat('%', :keyword, '%'))) and " +
           "i.status = 'AVAILABLE'")
    List<Item> searchItems(String category, ItemType type, String urgency, String keyword);
}