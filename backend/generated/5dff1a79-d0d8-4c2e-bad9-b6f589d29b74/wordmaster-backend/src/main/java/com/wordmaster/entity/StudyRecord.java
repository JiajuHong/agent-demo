package com.wordmaster.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("study_record")
public class StudyRecord {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("word_id")
    private Long wordId;
    
    @TableField("mastery_level")
    private Integer masteryLevel;
    
    @TableField("last_review_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastReviewTime;
    
    @TableField("next_review_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextReviewTime;
    
    @TableField("review_count")
    private Integer reviewCount;
    
    @TableField(value = "created_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;
    
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
    
    @Version
    @TableField("version")
    private Integer version;
}