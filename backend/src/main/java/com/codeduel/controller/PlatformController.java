package com.codeduel.controller;

import com.codeduel.dto.LanguageOptionDto;
import com.codeduel.dto.PlatformStatsDto;
import com.codeduel.repository.MatchRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/platform")
public class PlatformController {

    private final MatchRecordRepository matchRecordRepository;

    public PlatformController(MatchRecordRepository matchRecordRepository) {
        this.matchRecordRepository = matchRecordRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsDto> getStats() {
        int count = (int) matchRecordRepository.count();
        int activeBattlers = 2847;
        int queueCount = 42;
        int totalMatches = 14800 + count;
        return ResponseEntity.ok(new PlatformStatsDto(activeBattlers, queueCount, totalMatches));
    }

    @GetMapping("/languages")
    public ResponseEntity<List<LanguageOptionDto>> getLanguages() {
        return ResponseEntity.ok(List.of(
                new LanguageOptionDto("python", "Python 3", 71),
                new LanguageOptionDto("javascript", "JavaScript", 63),
                new LanguageOptionDto("cpp", "C++ 17", 54),
                new LanguageOptionDto("java", "Java 21", 62)
        ));
    }

    @GetMapping("/tiers")
    public ResponseEntity<List<Map<String, Object>>> getTiers() {
        return ResponseEntity.ok(List.of(
                Map.of("tier", "Beginner", "minRating", 0, "maxRating", 999),
                Map.of("tier", "Intermediate", "minRating", 1000, "maxRating", 1399),
                Map.of("tier", "Advanced", "minRating", 1400, "maxRating", 1799),
                Map.of("tier", "Expert", "minRating", 1800, "maxRating", 2199),
                Map.of("tier", "Master", "minRating", 2200, "maxRating", 3000)
        ));
    }
}
