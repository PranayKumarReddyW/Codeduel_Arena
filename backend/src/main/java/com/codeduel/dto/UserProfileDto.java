package com.codeduel.dto;

import com.codeduel.model.MatchRecord;

import java.util.List;

public class UserProfileDto {
    private String name;
    private String handle;
    private String bio;
    private int rating;
    private List<String> languages;
    private List<MatchRecord> matches;
    private UserStatsDto stats;
    private List<DayActivityDto> weeklyActivity;

    public UserProfileDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public List<String> getLanguages() {
        return languages;
    }

    public void setLanguages(List<String> languages) {
        this.languages = languages;
    }

    public List<MatchRecord> getMatches() {
        return matches;
    }

    public void setMatches(List<MatchRecord> matches) {
        this.matches = matches;
    }

    public UserStatsDto getStats() {
        return stats;
    }

    public void setStats(UserStatsDto stats) {
        this.stats = stats;
    }

    public List<DayActivityDto> getWeeklyActivity() {
        return weeklyActivity;
    }

    public void setWeeklyActivity(List<DayActivityDto> weeklyActivity) {
        this.weeklyActivity = weeklyActivity;
    }
}

