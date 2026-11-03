package com.codeduel.controller;

import com.codeduel.dto.RatingProgressionDto;
import com.codeduel.dto.UserProfileDto;
import com.codeduel.dto.UserProfileUpdateRequest;
import com.codeduel.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(userService.getUserProfile(authHeader));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestBody UserProfileUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(userService.updateUserProfile(request, authHeader));
    }

    @GetMapping("/progression")
    public ResponseEntity<List<RatingProgressionDto>> getProgression(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(userService.getRatingProgression(authHeader));
    }
}
