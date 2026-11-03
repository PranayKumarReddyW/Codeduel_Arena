package com.codeduel.controller;

import com.codeduel.dto.ExecuteCodeRequest;
import com.codeduel.dto.ExecuteCodeResponse;
import com.codeduel.dto.SubmitCodeRequest;
import com.codeduel.dto.SubmitCodeResponse;
import com.codeduel.service.CodeExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    public CodeExecutionController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/run")
    public ResponseEntity<ExecuteCodeResponse> runCode(@RequestBody ExecuteCodeRequest request) {
        return ResponseEntity.ok(codeExecutionService.runCode(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<SubmitCodeResponse> submitCode(@RequestBody SubmitCodeRequest request) {
        return ResponseEntity.ok(codeExecutionService.submitCode(request));
    }
}
