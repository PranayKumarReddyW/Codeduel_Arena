package com.codeduel.dto;

import com.codeduel.model.Example;
import com.codeduel.model.Problem;
import com.codeduel.model.TestCase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProblemDto {
    private String id;
    private String title;
    private String difficulty;
    private List<String> tags;
    private List<String> statement;
    private String inputFormat;
    private String outputFormat;
    private List<String> constraints;
    private List<Example> examples;
    private List<TestCase> tests;
    private Map<String, String> starter = new HashMap<>();

    public ProblemDto() {
    }

    public static ProblemDto fromEntity(Problem p) {
        if (p == null) return null;
        ProblemDto dto = new ProblemDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDifficulty(p.getDifficulty());
        dto.setTags(p.getTags());
        dto.setStatement(p.getStatement());
        dto.setInputFormat(p.getInputFormat());
        dto.setOutputFormat(p.getOutputFormat());
        dto.setConstraints(p.getConstraints());
        dto.setExamples(p.getExamples());
        dto.setTests(p.getTests());

        Map<String, String> starters = new HashMap<>();
        starters.put("python", p.getStarterPython());
        starters.put("javascript", p.getStarterJavascript());
        starters.put("cpp", p.getStarterCpp());
        starters.put("java", p.getStarterJava());
        dto.setStarter(starters);

        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getStatement() {
        return statement;
    }

    public void setStatement(List<String> statement) {
        this.statement = statement;
    }

    public String getInputFormat() {
        return inputFormat;
    }

    public void setInputFormat(String inputFormat) {
        this.inputFormat = inputFormat;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public List<String> getConstraints() {
        return constraints;
    }

    public void setConstraints(List<String> constraints) {
        this.constraints = constraints;
    }

    public List<Example> getExamples() {
        return examples;
    }

    public void setExamples(List<Example> examples) {
        this.examples = examples;
    }

    public List<TestCase> getTests() {
        return tests;
    }

    public void setTests(List<TestCase> tests) {
        this.tests = tests;
    }

    public Map<String, String> getStarter() {
        return starter;
    }

    public void setStarter(Map<String, String> starter) {
        this.starter = starter;
    }
}

