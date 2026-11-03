package com.codeduel.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "players")
public class Player {

    @Id
    private String id;
    private String name;
    private String handle;
    private int rating;
    private int wins;
    private int losses;
    private int streak;
    private String country;
    private int hue;

    public Player() {
    }

    public Player(String id, String name, String handle, int rating, int wins, int losses, int streak, String country, int hue) {
        this.id = id;
        this.name = name;
        this.handle = handle;
        this.rating = rating;
        this.wins = wins;
        this.losses = losses;
        this.streak = streak;
        this.country = country;
        this.hue = hue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
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

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public int getHue() {
        return hue;
    }

    public void setHue(int hue) {
        this.hue = hue;
    }
}

