package com.wordmaster.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("stat_record")
public class StatRecord {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("stat_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statDate;
    
    @TableField("learned_count")
    private Integer learnedCount;
    
    @TableField("reviewed_count")
    private Integer reviewedCount;
    
    @TableField("total_time")
    private Integer totalTime;
    
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
    
    @Version
    @TableField("version")
    private Integer version;
}