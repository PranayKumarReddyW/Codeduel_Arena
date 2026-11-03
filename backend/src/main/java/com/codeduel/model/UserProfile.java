package com.codeduel.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private String id;
    private String name;
    private String handle;

    @Column(length = 2000)
    private String bio;

    private int rating;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_languages", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "language")
    private List<String> languages = new ArrayList<>();

    public UserProfile() {
    }

    public UserProfile(String id, String name, String handle, String bio, int rating, List<String> languages) {
        this.id = id;
        this.name = name;
        this.handle = handle;
        this.bio = bio;
        this.rating = rating;
        this.languages = languages;
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
}

