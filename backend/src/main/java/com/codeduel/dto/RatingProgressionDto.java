package com.codeduel.dto;

public class RatingProgressionDto {
    private int n;
    private int rating;
    private String date;

    public RatingProgressionDto() {
    }

    public RatingProgressionDto(int n, int rating, String date) {
        this.n = n;
        this.rating = rating;
        this.date = date;
    }

    public int getN() {
        return n;
    }

    public void setN(int n) {
        this.n = n;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}

