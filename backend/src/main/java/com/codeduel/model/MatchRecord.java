package com.codeduel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "match_records")
public class MatchRecord {

    @Id
    private String id;

    @Column(name = "user_id")
    private String userId = "alexr";

    private String opponentId;
    private String problemId;
    private String difficulty;
    private String result; // "win" or "loss"
    private int delta;
    private int duration; // seconds
    private String date; // ISO-8601 string
    private String language;
    private int ratingAfter;

    public MatchRecord() {
    }

    public MatchRecord(String id, String userId, String opponentId, String problemId, String difficulty, String result, int delta, int duration, String date, String language, int ratingAfter) {
        this.id = id;
        this.userId = userId != null ? userId : "alexr";
        this.opponentId = opponentId;
        this.problemId = problemId;
        this.difficulty = difficulty;
        this.result = result;
        this.delta = delta;
        this.duration = duration;
        this.date = date;
        this.language = language;
        this.ratingAfter = ratingAfter;
    }

    public MatchRecord(String id, String opponentId, String problemId, String difficulty, String result, int delta, int duration, String date, String language, int ratingAfter) {
        this(id, "alexr", opponentId, problemId, difficulty, result, delta, duration, date, language, ratingAfter);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOpponentId() {
        return opponentId;
    }

    public void setOpponentId(String opponentId) {
        this.opponentId = opponentId;
    }

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public int getDelta() {
        return delta;
    }

    public void setDelta(int delta) {
        this.delta = delta;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public int getRatingAfter() {
        return ratingAfter;
    }

    public void setRatingAfter(int ratingAfter) {
        this.ratingAfter = ratingAfter;
    }
}

