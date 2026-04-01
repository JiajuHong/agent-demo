package com.wordmaster.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewPlanDTO {
    private Long id;
    private LocalDate reviewDate;
    private Integer totalWords;
    private Integer completedWords;
    private Boolean isCompleted;
    private Double completionRate;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}