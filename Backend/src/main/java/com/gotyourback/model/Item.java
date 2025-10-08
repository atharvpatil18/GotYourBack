package com.gotyourback.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @Enumerated(EnumType.STRING)
    private ItemType type;

    private String urgency;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL)
    private List<Request> requests = new ArrayList<>();

    public enum ItemType {
        LEND, SELL
    }

    public enum ItemStatus {
        AVAILABLE, SOLD, RETURNED, UNAVAILABLE
    }
}