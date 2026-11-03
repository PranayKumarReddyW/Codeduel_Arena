package com.codeduel.dto;

public class DayActivityDto {
    private String day;
    private int wins;
    private int losses;

    public DayActivityDto() {
    }

    public DayActivityDto(String day, int wins, int losses) {
        this.day = day;
        this.wins = wins;
        this.losses = losses;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }
}

