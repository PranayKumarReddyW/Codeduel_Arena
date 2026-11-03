package com.codeduel.controller;

import com.codeduel.model.Player;
import com.codeduel.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Player>> getLeaderboard(
            @RequestParam(required = false, defaultValue = "All-Time") String period,
            @RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(playerService.getLeaderboard(period, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable String id) {
        return playerService.getPlayerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
