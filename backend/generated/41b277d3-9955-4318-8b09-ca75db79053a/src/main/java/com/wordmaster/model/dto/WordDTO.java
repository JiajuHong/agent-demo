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
public class WordDTO {
    private Long id;
    private String word;
    private String phoneticSymbol;
    private String definition;
    private String example;
    private String partOfSpeech;
    private Integer difficulty;
    private Integer frequencyRank;
    private String imageUrl;
    private String audioUrl;
    private Long wordBookId;
    private String wordBookName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}