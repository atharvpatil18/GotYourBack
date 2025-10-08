package com.gotyourback.repository;

import com.gotyourback.model.Item;
import com.gotyourback.model.Item.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long ownerId);
    Long countByOwnerId(Long ownerId);
    
    @Query("SELECT i FROM Item i WHERE " +
           "(:category is null or i.category = :category) and " +
           "(:type is null or i.type = :type) and " +
           "(:urgency is null or i.urgency = :urgency) and " +
           "(:keyword is null or lower(i.name) like lower(concat('%', :keyword, '%'))) and " +
           "i.status != 'DONE'")
    List<Item> searchItems(String category, ItemType type, String urgency, String keyword);
}