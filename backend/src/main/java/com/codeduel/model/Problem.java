package com.codeduel.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    private String id;
    private String title;
    private String difficulty; // "Easy", "Medium", "Hard"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_tags", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_statements", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "paragraph", length = 4000)
    private List<String> statement = new ArrayList<>();

    @Column(length = 2000)
    private String inputFormat;

    @Column(length = 2000)
    private String outputFormat;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_constraints", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "constraint_text", length = 1000)
    private List<String> constraints = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_examples", joinColumns = @JoinColumn(name = "problem_id"))
    private List<Example> examples = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_tests", joinColumns = @JoinColumn(name = "problem_id"))
    private List<TestCase> tests = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String starterPython;

    @Column(columnDefinition = "TEXT")
    private String starterJavascript;

    @Column(columnDefinition = "TEXT")
    private String starterCpp;

    @Column(columnDefinition = "TEXT")
    private String starterJava;

    public Problem() {
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

    public String getStarterPython() {
        return starterPython;
    }

    public void setStarterPython(String starterPython) {
        this.starterPython = starterPython;
    }

    public String getStarterJavascript() {
        return starterJavascript;
    }

    public void setStarterJavascript(String starterJavascript) {
        this.starterJavascript = starterJavascript;
    }

    public String getStarterCpp() {
        return starterCpp;
    }

    public void setStarterCpp(String starterCpp) {
        this.starterCpp = starterCpp;
    }

    public String getStarterJava() {
        return starterJava;
    }

    public void setStarterJava(String starterJava) {
        this.starterJava = starterJava;
    }

    public List<TestCase> getSampleTests() {
        if (tests == null) return java.util.Collections.emptyList();
        return tests.stream().filter(t -> !t.isHidden()).toList();
    }

    public List<TestCase> getHiddenTests() {
        if (tests == null) return java.util.Collections.emptyList();
        return tests.stream().filter(TestCase::isHidden).toList();
    }
}

