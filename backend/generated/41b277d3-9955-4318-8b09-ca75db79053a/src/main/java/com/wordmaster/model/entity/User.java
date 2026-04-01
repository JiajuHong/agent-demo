package com.wordmaster.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "username"),
           @UniqueConstraint(columnNames = "email")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "daily_goal", nullable = false)
    private Integer dailyGoal = 20;

    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;

    @Column(name = "total_words_learned", nullable = false)
    private Integer totalWordsLearned = 0;

    @Column(name = "mastered_words", nullable = false)
    private Integer masteredWords = 0;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "experience_points", nullable = false)
    private Integer experiencePoints = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<LearningRecord> learningRecords = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ReviewPlan> reviewPlans = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (dailyGoal == null) dailyGoal = 20;
        if (streakDays == null) streakDays = 0;
        if (totalWordsLearned == null) totalWordsLearned = 0;
        if (masteredWords == null) masteredWords = 0;
        if (currentLevel == null) currentLevel = 1;
        if (experiencePoints == null) experiencePoints = 0;
        if (isActive == null) isActive = true;
    }
}