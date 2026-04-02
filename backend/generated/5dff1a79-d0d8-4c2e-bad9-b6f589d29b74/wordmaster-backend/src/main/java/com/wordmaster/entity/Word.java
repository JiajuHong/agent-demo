package com.wordmaster.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("word")
public class Word {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("word")
    private String word;
    
    @TableField("phonetic")
    private String phonetic;
    
    @TableField("definition")
    private String definition;
    
    @TableField("example")
    private String example;
    
    @TableField("difficulty")
    private Integer difficulty;
    
    @TableField("dictionary_id")
    private Long dictionaryId;
    
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
    
    @Version
    @TableField("version")
    private Integer version;
}