package com.codeduel.dto;

import java.util.List;

public class ExecuteCodeRequest {
    private String problemId;
    private String language; // "python" | "javascript" | "cpp" | "java"
    private String code;

    public ExecuteCodeRequest() {
    }

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}

