package com.codeduel.repository;

import com.codeduel.model.MatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRecordRepository extends JpaRepository<MatchRecord, String> {
    List<MatchRecord> findAllByOrderByDateDesc();
    List<MatchRecord> findByResultOrderByDateDesc(String result);
    List<MatchRecord> findByDifficultyOrderByDateDesc(String difficulty);
    List<MatchRecord> findByResultAndDifficultyOrderByDateDesc(String result, String difficulty);

    List<MatchRecord> findByUserIdOrderByDateDesc(String userId);
    List<MatchRecord> findByUserIdAndResultIgnoreCaseOrderByDateDesc(String userId, String result);
    List<MatchRecord> findByUserIdAndDifficultyIgnoreCaseOrderByDateDesc(String userId, String difficulty);
    List<MatchRecord> findByUserIdAndResultIgnoreCaseAndDifficultyIgnoreCaseOrderByDateDesc(String userId, String result, String difficulty);
}

