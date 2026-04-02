package com.wordmaster.controller;

import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.WordResponse;
import com.wordmaster.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/words")
@RequiredArgsConstructor
@Tag(name = "单词管理", description = "单词查询、搜索等相关接口")
public class WordController {
    
    private final WordService wordService;
    
    @GetMapping("/{id}")
    @Operation(summary = "获取单词详情", description = "根据单词ID获取单词详细信息")
    public ApiResponse<WordResponse> getWordById(
            @Parameter(description = "单词ID", required = true)
            @PathVariable Long id) {
        WordResponse wordResponse = wordService.getWordDetail(id);
        return ApiResponse.success(wordResponse);
    }
    
    @GetMapping("/search")
    @Operation(summary = "搜索单词", description = "根据关键词搜索单词")
    public ApiResponse<List<WordResponse>> searchWords(
            @Parameter(description = "搜索关键词", required = true)
            @RequestParam String keyword,
            @Parameter(description = "页码，默认1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小，默认10")
            @RequestParam(defaultValue = "10") int size) {
        List<WordResponse> words = wordService.searchWords(keyword, page, size);
        return ApiResponse.success(words);
    }
    
    @GetMapping("/random")
    @Operation(summary = "获取随机单词", description = "获取指定数量的随机单词")
    public ApiResponse<List<WordResponse>> getRandomWords(
            @Parameter(description = "单词数量，默认10")
            @RequestParam(defaultValue = "10") int count) {
        List<WordResponse> words = wordService.getRandomWords(count);
        return ApiResponse.success(words);
    }
    
    @GetMapping("/dictionary/{dictionaryId}")
    @Operation(summary = "获取词库单词", description = "根据词库ID获取单词列表")
    public ApiResponse<List<WordResponse>> getWordsByDictionary(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long dictionaryId,
            @Parameter(description = "页码，默认1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小，默认10")
            @RequestParam(defaultValue = "10") int size) {
        List<WordResponse> words = wordService.getWordsByDictionary(dictionaryId, page, size);
        return ApiResponse.success(words);
    }
    
    @GetMapping("/difficulty/{difficulty}")
    @Operation(summary = "根据难度获取单词", description = "根据难度等级获取单词列表")
    public ApiResponse<List<WordResponse>> getWordsByDifficulty(
            @Parameter(description = "难度等级（1-5）", required = true)
            @PathVariable int difficulty,
            @Parameter(description = "最大数量，默认20")
            @RequestParam(defaultValue = "20") int limit) {
        List<WordResponse> words = wordService.getWordsByDifficulty(difficulty, limit);
        return ApiResponse.success(words);
    }
    
    @GetMapping("/query/{word}")
    @Operation(summary = "查询单词", description = "从网易API查询单词详细信息")
    public ApiResponse<WordResponse> queryWord(
            @Parameter(description = "单词", required = true)
            @PathVariable String word) {
        WordResponse wordResponse = wordService.queryWordFromNetease(word);
        return ApiResponse.success(wordResponse);
    }
}