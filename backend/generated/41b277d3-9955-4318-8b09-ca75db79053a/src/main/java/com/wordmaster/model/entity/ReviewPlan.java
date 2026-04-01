package com.wordmaster.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_plans",
       indexes = {
           @Index(name = "idx_user_date", columnList = "user_id, review_date"),
           @Index(name = "idx_completed", columnList = "is_completed")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(name = "total_words", nullable = false)
    private Integer totalWords = 0;

    @Column(name = "completed_words", nullable = false)
    private Integer completedWords = 0;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "completion_rate", nullable = false)
    private Double completionRate = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (totalWords == null) totalWords = 0;
        if (completedWords == null) completedWords = 0;
        if (isCompleted == null) isCompleted = false;
        if (completionRate == null) completionRate = 0.0;
        
        if (reviewDate == null) {
            reviewDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (totalWords > 0) {
            completionRate = (double) completedWords / totalWords;
        }
        if (completedWords >= totalWords && totalWords > 0) {
            isCompleted = true;
        }
    }
}