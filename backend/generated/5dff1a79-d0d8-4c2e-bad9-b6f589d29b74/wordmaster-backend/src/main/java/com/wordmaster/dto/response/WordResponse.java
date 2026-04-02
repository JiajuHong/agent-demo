package com.wordmaster.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "单词响应")
public class WordResponse {
    
    @Schema(description = "单词ID", example = "1")
    private Long id;
    
    @Schema(description = "单词", example = "abandon")
    private String word;
    
    @Schema(description = "音标", example = "/əˈbændən/")
    private String phonetic;
    
    @Schema(description = "释义", example = "v. 放弃，抛弃")
    private String definition;
    
    @Schema(description = "例句", example = "He abandoned his car and continued on foot.")
    private String example;
    
    @Schema(description = "难度等级", example = "3")
    private Integer difficulty;
    
    @Schema(description = "词库ID", example = "1")
    private Long dictionaryId;
    
    @Schema(description = "词库名称", example = "四级核心词汇")
    private String dictionaryName;
}