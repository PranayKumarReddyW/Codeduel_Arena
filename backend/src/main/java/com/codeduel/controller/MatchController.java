package com.codeduel.controller;

import com.codeduel.dto.RecordMatchRequest;
import com.codeduel.model.MatchRecord;
import com.codeduel.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<MatchRecord>> getMatches(
            @RequestParam(required = false, defaultValue = "All") String outcome,
            @RequestParam(required = false, defaultValue = "All") String difficulty,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(matchService.getMatches(outcome, difficulty, authHeader));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchRecord> getMatchById(@PathVariable String id) {
        return matchService.getMatchById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MatchRecord> recordMatch(
            @RequestBody RecordMatchRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(matchService.recordMatch(request, authHeader));
    }
}
