package com.gotyourback.service;

import com.gotyourback.model.Request.RequestStatus;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.dto.RequestDto;
import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Request;
import com.gotyourback.model.Item;
import com.gotyourback.model.User;
import com.gotyourback.model.Notification;
import com.gotyourback.repository.RequestRepository;
import com.gotyourback.repository.ItemRepository;
import com.gotyourback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    private ItemDto createItemDto(Item item) {
        ItemDto dto = new ItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setType(item.getType());
        dto.setImageUrl(item.getImageUrl());
        dto.setOwnerId(item.getOwner().getId());
        dto.setOwnerName(item.getOwner().getName());
        return dto;
    }

    @Transactional
    public RequestDto createRequest(RequestDto requestDto) {
        Item item = itemRepository.findById(requestDto.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
                
        User requester = userRepository.findById(requestDto.getRequesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requester not found"));

        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item is not available");
        }

        Request request = new Request();
        request.setItem(item);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);
        
        request = requestRepository.save(request);
        
        // Create notification for item owner
        notificationService.createNotification(
            item.getOwner().getId(),
            Notification.NotificationType.REQUEST_CREATED,
            requester.getName() + " has requested your item: " + item.getName(),
            item.getId(),
            request.getId(),
            null
        );
        
        return convertToDto(request);
    }

    @Transactional
    public RequestDto updateRequestStatus(Long id, RequestStatus status) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        RequestStatus oldStatus = request.getStatus();
        request.setStatus(status);
        if (status == RequestStatus.ACCEPTED) {
            request.getItem().setStatus(ItemStatus.UNAVAILABLE);
            
            // Notify requester that their request was accepted
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_ACCEPTED,
                "Your request for '" + request.getItem().getName() + "' has been accepted",
                request.getItem().getId(),
                request.getId(),
                null
            );
        } else if (status == RequestStatus.REJECTED) {
            // Notify requester that their request was rejected
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_REJECTED,
                "Your request for '" + request.getItem().getName() + "' has been rejected",
                request.getItem().getId(),
                request.getId(),
                null
            );
        }
        
        // Notify for status changes other than ACCEPTED/REJECTED (which already have specific notifications)
        if (oldStatus != status && status != RequestStatus.ACCEPTED && status != RequestStatus.REJECTED) {
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                "Status of your request for '" + request.getItem().getName() + "' changed to " + status,
                request.getItem().getId(),
                request.getId(),
                null
            );
        }
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }

    @Transactional
    public RequestDto markRequestAsDone(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        request.setStatus(RequestStatus.DONE);
        // Don't set item back to AVAILABLE yet - wait for return confirmation
        
        // Notify both requester and owner that request is completed
        notificationService.createNotification(
            request.getRequester().getId(),
            Notification.NotificationType.REQUEST_COMPLETED,
            "Your request for '" + request.getItem().getName() + "' is completed. Please confirm return.",
            request.getItem().getId(),
            request.getId(),
            null
        );
        
        notificationService.createNotification(
            request.getItem().getOwner().getId(),
            Notification.NotificationType.REQUEST_COMPLETED,
            "Request for your item '" + request.getItem().getName() + "' is completed. Await return confirmation.",
            request.getItem().getId(),
            request.getId(),
            null
        );
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }
    
    @Transactional
    public RequestDto confirmReturn(Long requestId, Long userId, boolean isBorrower) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        if (request.getStatus() != RequestStatus.DONE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request must be in DONE status");
        }
        
        if (isBorrower) {
            // Borrower confirms they returned the item
            request.setBorrowerConfirmedReturn(true);
            notificationService.createNotification(
                request.getItem().getOwner().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                request.getRequester().getName() + " confirmed returning '" + request.getItem().getName() + "'",
                request.getItem().getId(),
                request.getId(),
                null
            );
        } else {
            // Lender confirms they received the item back
            request.setLenderConfirmedReturn(true);
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                request.getItem().getOwner().getName() + " confirmed receiving '" + request.getItem().getName() + "'",
                request.getItem().getId(),
                request.getId(),
                null
            );
        }
        
        // If both confirmed, update item status and completion timestamp
        // Note: Request is already in DONE status (verified at method entry), but we keep this check
        // to ensure both confirmations are complete before changing item availability
        if (Boolean.TRUE.equals(request.getBorrowerConfirmedReturn()) && Boolean.TRUE.equals(request.getLenderConfirmedReturn())) {
            // For SELL items, mark as SOLD; for LEND items, make available again
            if (request.getItem().getType() == Item.ItemType.SELL) {
                request.getItem().setStatus(ItemStatus.SOLD);
            } else {
                request.getItem().setStatus(ItemStatus.AVAILABLE);
            }
            
            request.setCompletedAt(java.time.LocalDateTime.now());
            
            // Notify both parties
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                "Item '" + request.getItem().getName() + "' return confirmed by both parties",
                request.getItem().getId(),
                request.getId(),
                null
            );
            
            notificationService.createNotification(
                request.getItem().getOwner().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                "Item '" + request.getItem().getName() + "' return confirmed. Item is now available again.",
                request.getItem().getId(),
                request.getId(),
                null
            );
        }
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }
    
    @Transactional
    public RequestDto markAsLent(Long requestId, Long userId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        if (!request.getItem().getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can mark item as lent");
        }
        
        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request must be in ACCEPTED status");
        }
        
        request.setLenderMarkedAsLent(true);
        request.setLentAt(java.time.LocalDateTime.now());
        
        // Notify borrower that item is ready/lent
        notificationService.createNotification(
            request.getRequester().getId(),
            Notification.NotificationType.REQUEST_STATUS_CHANGED,
            "'" + request.getItem().getName() + "' has been marked as lent by " + request.getItem().getOwner().getName() + ". Please confirm receipt.",
            request.getItem().getId(),
            request.getId(),
            null
        );
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }
    
    @Transactional
    public RequestDto confirmReceipt(Long requestId, Long userId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        if (!request.getRequester().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the borrower can confirm receipt");
        }
        
        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request must be in ACCEPTED status");
        }
        
        if (!Boolean.TRUE.equals(request.getLenderMarkedAsLent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lender must mark item as lent first");
        }
        
        request.setBorrowerConfirmedReceipt(true);
        request.setReceivedAt(java.time.LocalDateTime.now());
        
        // For SELL items, mark as DONE and SOLD immediately after receipt confirmation
        if (request.getItem().getType() == Item.ItemType.SELL) {
            request.setStatus(RequestStatus.DONE);
            request.getItem().setStatus(ItemStatus.SOLD);
            request.setCompletedAt(java.time.LocalDateTime.now());
            
            // Notify both parties that transaction is complete
            notificationService.createNotification(
                request.getItem().getOwner().getId(),
                Notification.NotificationType.REQUEST_COMPLETED,
                "'" + request.getItem().getName() + "' has been sold to " + request.getRequester().getName(),
                request.getItem().getId(),
                request.getId(),
                null
            );
            
            notificationService.createNotification(
                request.getRequester().getId(),
                Notification.NotificationType.REQUEST_COMPLETED,
                "You have purchased '" + request.getItem().getName() + "'. Transaction complete.",
                request.getItem().getId(),
                request.getId(),
                null
            );
        } else {
            // For LEND items, just notify owner that borrower confirmed receipt
            notificationService.createNotification(
                request.getItem().getOwner().getId(),
                Notification.NotificationType.REQUEST_STATUS_CHANGED,
                request.getRequester().getName() + " confirmed receiving '" + request.getItem().getName() + "'",
                request.getItem().getId(),
                request.getId(),
                null
            );
        }
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }

    public List<RequestDto> getRequestsByRequesterId(Long userId) {
        return requestRepository.findByRequesterId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<RequestDto> getReceivedRequests(Long userId) {
        return requestRepository.findByItem_OwnerId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<RequestDto> getAcceptedRequestsForUser(Long userId) {
        List<Request> requests = requestRepository.findByRequesterIdAndStatus(userId, RequestStatus.ACCEPTED);
        requests.addAll(requestRepository.findByItem_OwnerIdAndStatus(userId, RequestStatus.ACCEPTED));
        return requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private RequestDto convertToDto(Request request) {
        RequestDto dto = new RequestDto();
        dto.setId(request.getId());
        dto.setItemId(request.getItem().getId());
        dto.setRequesterId(request.getRequester().getId());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        
        // Set requester details
        dto.setRequesterName(request.getRequester().getName());
        dto.setRequesterEmail(request.getRequester().getEmail());
        
        // Set owner details from the item
        User owner = request.getItem().getOwner();
        dto.setOwnerName(owner.getName());
        dto.setOwnerEmail(owner.getEmail());
        
        // Set return confirmation fields
        dto.setBorrowerConfirmedReturn(request.getBorrowerConfirmedReturn());
        dto.setLenderConfirmedReturn(request.getLenderConfirmedReturn());
        dto.setLenderMarkedAsLent(request.getLenderMarkedAsLent());
        dto.setBorrowerConfirmedReceipt(request.getBorrowerConfirmedReceipt());
        dto.setLentAt(request.getLentAt());
        dto.setReceivedAt(request.getReceivedAt());
        dto.setCompletedAt(request.getCompletedAt());
        
        // Set full item details
        dto.setItem(createItemDto(request.getItem()));
        
        // Set item details using ItemServiceImpl convertToDto
        ItemDto itemDto = new ItemDto();
        Item item = request.getItem();
        itemDto.setId(item.getId());
        itemDto.setName(item.getName());
        itemDto.setDescription(item.getDescription());
        itemDto.setCategory(item.getCategory());
        itemDto.setType(item.getType());
        itemDto.setUrgency(item.getUrgency());
        itemDto.setImageUrl(item.getImageUrl());
        itemDto.setOwnerId(item.getOwner().getId());
        itemDto.setOwnerName(item.getOwner().getName());
        itemDto.setOwnerEmail(item.getOwner().getEmail());
        dto.setItem(itemDto);
        
        // Set creation date
        if (request.getCreatedAt() != null) {
            dto.setCreatedAt(request.getCreatedAt());
        }
        
        return dto;
    }
}