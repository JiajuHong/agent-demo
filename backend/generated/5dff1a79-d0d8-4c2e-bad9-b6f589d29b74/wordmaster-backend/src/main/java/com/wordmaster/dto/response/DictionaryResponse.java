package com.wordmaster.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "词库响应")
public class DictionaryResponse {
    
    @Schema(description = "词库ID", example = "1")
    private Long id;
    
    @Schema(description = "词库名称", example = "四级核心词汇")
    private String name;
    
    @Schema(description = "词库描述", example = "大学英语四级考试核心词汇")
    private String description;
    
    @Schema(description = "分类", example = "CET4")
    private String category;
    
    @Schema(description = "总单词数", example = "3000")
    private Integer totalWords;
    
    @Schema(description = "已学单词数", example = "150")
    private Integer learnedWords;
    
    @Schema(description = "学习进度", example = "5.0")
    private Double progress;
}