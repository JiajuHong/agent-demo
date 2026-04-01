package com.wordmaster.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_records",
       indexes = {
           @Index(name = "idx_user_word", columnList = "user_id, word_id"),
           @Index(name = "idx_next_review", columnList = "next_review_at"),
           @Index(name = "idx_mastery_level", columnList = "mastery_level")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mastery_level", nullable = false)
    private Integer masteryLevel = 0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount = 0;

    @Column(name = "wrong_count", nullable = false)
    private Integer wrongCount = 0;

    @Column(name = "last_review_at")
    private LocalDateTime lastReviewAt;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    @Column(name = "easiness_factor", nullable = false)
    private Double easinessFactor = 2.5;

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 1;

    @Column(name = "is_mastered", nullable = false)
    private Boolean isMastered = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @PrePersist
    protected void onCreate() {
        if (masteryLevel == null) masteryLevel = 0;
        if (reviewCount == null) reviewCount = 0;
        if (correctCount == null) correctCount = 0;
        if (wrongCount == null) wrongCount = 0;
        if (easinessFactor == null) easinessFactor = 2.5;
        if (intervalDays == null) intervalDays = 1;
        if (isMastered == null) isMastered = false;
        
        if (nextReviewAt == null) {
            nextReviewAt = LocalDateTime.now().plusDays(intervalDays);
        }
    }
}