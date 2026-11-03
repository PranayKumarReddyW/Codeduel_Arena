package com.codeduel.controller;

import com.codeduel.dto.MatchRoomDto;
import com.codeduel.dto.MatchmakingRequest;
import com.codeduel.dto.MatchmakingResponse;
import com.codeduel.service.MatchmakingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/find")
    public ResponseEntity<MatchmakingResponse> findMatch(
            @RequestBody(required = false) MatchmakingRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        MatchmakingResponse res = matchmakingService.findMatch(request, authHeader);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/room/{matchId}")
    public ResponseEntity<MatchRoomDto> getMatchRoom(
            @PathVariable String matchId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        MatchRoomDto room = matchmakingService.getMatchRoom(matchId, authHeader);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelQueue(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        matchmakingService.cancelQueue(authHeader);
        return ResponseEntity.ok().build();
    }
}
