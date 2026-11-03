package com.codeduel.service;

import com.codeduel.dto.ProblemDto;
import com.codeduel.model.Problem;
import com.codeduel.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public List<ProblemDto> getAllProblems() {
        return problemRepository.findAll().stream()
                .map(ProblemDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<ProblemDto> getProblemById(String id) {
        return problemRepository.findById(id).map(ProblemDto::fromEntity);
    }

    public Problem getProblemEntity(String id) {
        return problemRepository.findById(id).orElse(null);
    }
}

