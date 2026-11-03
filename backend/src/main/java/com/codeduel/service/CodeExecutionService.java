package com.codeduel.service;

import com.codeduel.dto.ExecuteCodeRequest;
import com.codeduel.dto.ExecuteCodeResponse;
import com.codeduel.dto.SubmitCodeRequest;
import com.codeduel.dto.SubmitCodeResponse;
import com.codeduel.dto.TestCaseResult;
import com.codeduel.model.Problem;
import com.codeduel.model.TestCase;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CodeExecutionService {

    private final ProblemService problemService;
    private final Judge0Service judge0Service;

    private static final Map<String, String> LANGUAGE_LABELS = Map.of(
            "python", "Python 3",
            "javascript", "JavaScript",
            "cpp", "C++ 17",
            "java", "Java 21"
    );

    public CodeExecutionService(ProblemService problemService, Judge0Service judge0Service) {
        this.problemService = problemService;
        this.judge0Service = judge0Service;
    }

    public ExecuteCodeResponse runCode(ExecuteCodeRequest req) {
        Problem problem = problemService.getProblemEntity(req.getProblemId());
        if (problem == null) {
            throw new IllegalArgumentException("Problem not found: " + req.getProblemId());
        }

        String starter = getStarterForLanguage(problem, req.getLanguage());
        List<TestCaseResult> results = judge0Service.executeTests(
                req.getLanguage(),
                req.getCode(),
                problem.getSampleTests(),
                starter
        );

        long passedCount = results.stream().filter(r -> "pass".equalsIgnoreCase(r.getStatus())).count();
        boolean allPassed = passedCount == results.size() && !results.isEmpty();

        String langLabel = LANGUAGE_LABELS.getOrDefault(req.getLanguage().toLowerCase(), req.getLanguage());
        List<String> logs = new ArrayList<>();
        logs.add("> Compiling " + langLabel + "...");
        logs.add("> Running sample tests...");
        if (allPassed) {
            logs.add("✓ " + results.size() + "/" + results.size() + " sample tests passed");
        } else {
            logs.add("✗ " + passedCount + "/" + results.size() + " sample tests passed");
        }

        for (int i = 0; i < results.size(); i++) {
            TestCaseResult r = results.get(i);
            if (r.getStdout() != null && !r.getStdout().trim().isEmpty()) {
                logs.add("--- Case " + (i + 1) + " Console Output ---");
                for (String line : r.getStdout().split("\n")) {
                    logs.add("  " + line);
                }
            }
        }

        ExecuteCodeResponse resp = new ExecuteCodeResponse();
        resp.setSuccess(allPassed);
        resp.setLogs(logs);
        resp.setResults(results);
        resp.setMock(!judge0Service.isLiveJudge0Configured());

        return resp;
    }

    public SubmitCodeResponse submitCode(SubmitCodeRequest req) {
        Problem problem = problemService.getProblemEntity(req.getProblemId());
        if (problem == null) {
            throw new IllegalArgumentException("Problem not found: " + req.getProblemId());
        }

        String starter = getStarterForLanguage(problem, req.getLanguage());
        // Run all test cases (both visible sample tests and hidden tests)
        List<TestCaseResult> allResults = judge0Service.executeTests(
                req.getLanguage(),
                req.getCode(),
                problem.getTests(),
                starter
        );

        long passedCount = allResults.stream().filter(r -> "pass".equalsIgnoreCase(r.getStatus())).count();
        int totalTests = allResults.size();
        int passedTests = (int) passedCount;
        boolean accepted = passedCount == totalTests && totalTests > 0;

        double runtime = allResults.isEmpty() ? 15.0 : allResults.stream().mapToDouble(TestCaseResult::getTime).max().orElse(15.0);
        double memory = allResults.isEmpty() ? 14.2 : allResults.stream().mapToDouble(TestCaseResult::getMemory).max().orElse(14.2);

        String langLabel = LANGUAGE_LABELS.getOrDefault(req.getLanguage().toLowerCase(), req.getLanguage());
        List<String> logs = new ArrayList<>();
        logs.add("> Compiling " + langLabel + "...");
        logs.add("> Running " + totalTests + " test cases (sample + hidden)...");

        if (accepted) {
            logs.add("✓ Accepted — " + totalTests + "/" + totalTests + " tests passed");
            logs.add("Runtime: " + (int) runtime + "ms · Memory: " + memory + "MB");
        } else {
            int firstFail = 1;
            String failDetail = "";
            for (int i = 0; i < allResults.size(); i++) {
                if (!"pass".equalsIgnoreCase(allResults.get(i).getStatus())) {
                    firstFail = i + 1;
                    TestCaseResult r = allResults.get(i);
                    failDetail = "Expected: " + r.getExpected() + " · Got: " + r.getOutput();
                    break;
                }
            }
            logs.add("✗ Wrong Answer on test " + firstFail + " (" + passedTests + "/" + totalTests + " passed)");
            if (!failDetail.isEmpty()) {
                logs.add(failDetail);
            }
        }

        for (int i = 0; i < allResults.size(); i++) {
            TestCaseResult r = allResults.get(i);
            if (r.getStdout() != null && !r.getStdout().trim().isEmpty()) {
                logs.add("--- Case " + (i + 1) + " Console Output ---");
                for (String line : r.getStdout().split("\n")) {
                    logs.add("  " + line);
                }
            }
        }

        SubmitCodeResponse resp = new SubmitCodeResponse();
        resp.setAccepted(accepted);
        resp.setPassedTests(passedTests);
        resp.setTotalTests(totalTests);
        resp.setRuntimeMs(runtime);
        resp.setMemoryMb(memory);
        resp.setLogs(logs);
        resp.setResults(allResults);
        resp.setMock(!judge0Service.isLiveJudge0Configured());

        return resp;
    }

    private String getStarterForLanguage(Problem p, String language) {
        if (language == null) return p.getStarterPython();
        return switch (language.toLowerCase()) {
            case "javascript" -> p.getStarterJavascript();
            case "cpp" -> p.getStarterCpp();
            case "java" -> p.getStarterJava();
            default -> p.getStarterPython();
        };
    }
}

