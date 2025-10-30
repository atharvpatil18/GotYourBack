package com.gotyourback.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "borrower_confirmed_return")
    private Boolean borrowerConfirmedReturn = false;
    
    @Column(name = "lender_confirmed_return")
    private Boolean lenderConfirmedReturn = false;
    
    @Column(name = "lender_marked_as_lent")
    private Boolean lenderMarkedAsLent = false;
    
    @Column(name = "borrower_confirmed_receipt")
    private Boolean borrowerConfirmedReceipt = false;
    
    @Column(name = "lent_at")
    private LocalDateTime lentAt;
    
    @Column(name = "received_at")
    private LocalDateTime receivedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum RequestStatus {
        PENDING, ACCEPTED, REJECTED, DONE
    }
}