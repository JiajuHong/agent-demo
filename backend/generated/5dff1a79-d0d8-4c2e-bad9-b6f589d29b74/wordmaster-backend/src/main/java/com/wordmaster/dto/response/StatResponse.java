package com.wordmaster.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "统计响应")
public class StatResponse {
    
    @Schema(description = "统计ID", example = "1")
    private Long id;
    
    @Schema(description = "用户ID", example = "1")
    private Long userId;
    
    @Schema(description = "统计日期", example = "2023-10-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statDate;
    
    @Schema(description = "学习单词数", example = "10")
    private Integer learnedCount;
    
    @Schema(description = "复习单词数", example = "15")
    private Integer reviewedCount;
    
    @Schema(description = "总学习时间（分钟）", example = "45")
    private Integer totalTime;
}