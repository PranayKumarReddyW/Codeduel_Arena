package com.codeduel.dto;

public class LanguageOptionDto {
    private String id;
    private String label;
    private int judge0Id;

    public LanguageOptionDto() {
    }

    public LanguageOptionDto(String id, String label, int judge0Id) {
        this.id = id;
        this.label = label;
        this.judge0Id = judge0Id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getJudge0Id() {
        return judge0Id;
    }

    public void setJudge0Id(int judge0Id) {
        this.judge0Id = judge0Id;
    }
}

