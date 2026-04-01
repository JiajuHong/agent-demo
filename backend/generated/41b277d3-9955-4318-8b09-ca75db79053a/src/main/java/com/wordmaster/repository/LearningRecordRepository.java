package com.wordmaster.repository;

import com.wordmaster.model.entity.LearningRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRecordRepository extends JpaRepository<LearningRecord, Long> {
    Optional<LearningRecord> findByUserIdAndWordId(Long userId, Long wordId);
    List<LearningRecord> findByUserId(Long userId);
    Page<LearningRecord> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT lr FROM LearningRecord lr WHERE lr.user.id = :userId AND lr.word.wordBook.id = :bookId")
    List<LearningRecord> findByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);
    
    @Query("SELECT lr FROM LearningRecord lr WHERE lr.user.id = :userId AND lr.nextReviewAt <= :now AND lr.isMastered = false")
    List<LearningRecord> findDueForReview(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(lr) FROM LearningRecord lr WHERE lr.user.id = :userId AND lr.isMastered = true")
    Long countMasteredWords(@Param("userId") Long userId);
    
    @Query("SELECT lr FROM LearningRecord lr WHERE lr.user.id = :userId AND lr.isMastered = false ORDER BY lr.nextReviewAt ASC")
    List<LearningRecord> findPendingReview(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT lr FROM LearningRecord lr WHERE lr.user.id = :userId AND lr.lastReviewAt >= :startDate AND lr.lastReviewAt <= :endDate")
    List<LearningRecord> findByUserIdAndReviewDateRange(@Param("userId") Long userId, 
                                                        @Param("startDate") LocalDateTime startDate, 
                                                        @Param("endDate") LocalDateTime endDate);
    
    @Modifying
    @Query("UPDATE LearningRecord lr SET lr.masteryLevel = lr.masteryLevel + 1, " +
           "lr.reviewCount = lr.reviewCount + 1, " +
           "lr.correctCount = lr.correctCount + 1, " +
           "lr.lastReviewAt = :now, " +
           "lr.nextReviewAt = :nextReviewAt, " +
           "lr.easinessFactor = :easinessFactor, " +
           "lr.intervalDays = :intervalDays, " +
           "lr.isMastered = CASE WHEN lr.masteryLevel + 1 >= :masteryThreshold THEN true ELSE false END " +
           "WHERE lr.id = :recordId")
    void updateForCorrectAnswer(@Param("recordId") Long recordId,
                                @Param("now") LocalDateTime now,
                                @Param("nextReviewAt") LocalDateTime nextReviewAt,
                                @Param("easinessFactor") Double easinessFactor,
                                @Param("intervalDays") Integer intervalDays,
                                @Param("masteryThreshold") Integer masteryThreshold);
    
    @Modifying
    @Query("UPDATE LearningRecord lr SET lr.reviewCount = lr.reviewCount + 1, " +
           "lr.wrongCount = lr.wrongCount + 1, " +
           "lr.lastReviewAt = :now, " +
           "lr.nextReviewAt = :nextReviewAt, " +
           "lr.easinessFactor = :easinessFactor, " +
           "lr.intervalDays = :intervalDays " +
           "WHERE lr.id = :recordId")
    void updateForWrongAnswer(@Param("recordId") Long recordId,
                              @Param("now") LocalDateTime now,
                              @Param("nextReviewAt") LocalDateTime nextReviewAt,
                              @Param("easinessFactor") Double easinessFactor,
                              @Param("intervalDays") Integer intervalDays);
}