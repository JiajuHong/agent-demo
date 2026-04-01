package com.wordmaster.repository;

import com.wordmaster.model.entity.ReviewPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewPlanRepository extends JpaRepository<ReviewPlan, Long> {
    Optional<ReviewPlan> findByUserIdAndReviewDate(Long userId, LocalDate reviewDate);
    List<ReviewPlan> findByUserId(Long userId);
    List<ReviewPlan> findByUserIdAndReviewDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT rp FROM ReviewPlan rp WHERE rp.user.id = :userId AND rp.isCompleted = false AND rp.reviewDate <= :today")
    List<ReviewPlan> findPendingPlans(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    @Modifying
    @Query("UPDATE ReviewPlan rp SET rp.completedWords = rp.completedWords + 1 WHERE rp.id = :planId")
    void incrementCompletedWords(@Param("planId") Long planId);
}