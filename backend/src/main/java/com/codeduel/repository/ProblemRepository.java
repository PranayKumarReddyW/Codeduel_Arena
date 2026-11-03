package com.codeduel.repository;

import com.codeduel.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, String> {
    List<Problem> findByDifficulty(String difficulty);
}

