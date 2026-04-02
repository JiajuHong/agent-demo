package com.wordmaster.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "学习请求")
public class StudyRequest {
    
    @NotNull(message = "单词ID不能为空")
    @Schema(description = "单词ID", example = "1")
    private Long wordId;
    
    @NotNull(message = "掌握程度不能为空")
    @Min(value = 1, message = "掌握程度最小为1")
    @Max(value = 5, message = "掌握程度最大为5")
    @Schema(description = "掌握程度（1-5）", example = "3")
    private Integer mastery;
}