package com.gotyourback.service;

import com.gotyourback.model.Request.RequestStatus;
import com.gotyourback.model.Item.ItemStatus;
import com.gotyourback.dto.RequestDto;
import com.gotyourback.dto.ItemDto;
import com.gotyourback.model.Request;
import com.gotyourback.model.Item;
import com.gotyourback.model.User;
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
        return convertToDto(request);
    }

    @Transactional
    public RequestDto updateRequestStatus(Long id, RequestStatus status) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        request.setStatus(status);
        if (status == RequestStatus.ACCEPTED) {
            request.getItem().setStatus(ItemStatus.UNAVAILABLE);
        }
        
        request = requestRepository.save(request);
        return convertToDto(request);
    }

    @Transactional
    public RequestDto markRequestAsDone(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        request.setStatus(RequestStatus.DONE);
        request.getItem().setStatus(ItemStatus.AVAILABLE);
        
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