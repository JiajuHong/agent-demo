package com.wordmaster.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "学习记录响应")
public class StudyRecordResponse {
    
    @Schema(description = "记录ID", example = "1")
    private Long id;
    
    @Schema(description = "用户ID", example = "1")
    private Long userId;
    
    @Schema(description = "单词ID", example = "1")
    private Long wordId;
    
    @Schema(description = "单词", example = "abandon")
    private String word;
    
    @Schema(description = "掌握程度", example = "3")
    private Integer masteryLevel;
    
    @Schema(description = "上次复习时间", example = "2023-10-01 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastReviewTime;
    
    @Schema(description = "下次复习时间", example = "2023-10-02 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextReviewTime;
    
    @Schema(description = "复习次数", example = "2")
    private Integer reviewCount;
    
    @Schema(description = "创建时间", example = "2023-10-01 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;
}