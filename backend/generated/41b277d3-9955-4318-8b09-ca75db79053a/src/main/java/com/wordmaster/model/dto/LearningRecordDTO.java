package com.wordmaster.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRecordDTO {
    private Long id;
    private Integer masteryLevel;
    private Integer reviewCount;
    private Integer correctCount;
    private Integer wrongCount;
    private LocalDateTime lastReviewAt;
    private LocalDateTime nextReviewAt;
    private Double easinessFactor;
    private Integer intervalDays;
    private Boolean isMastered;
    private Long userId;
    private Long wordId;
    private String word;
    private String definition;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}