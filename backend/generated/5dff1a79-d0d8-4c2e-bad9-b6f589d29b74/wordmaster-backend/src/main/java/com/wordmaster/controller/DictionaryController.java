package com.wordmaster.controller;

import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.DictionaryResponse;
import com.wordmaster.entity.Dictionary;
import com.wordmaster.service.DictionaryService;
import com.wordmaster.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dictionaries")
@RequiredArgsConstructor
@Tag(name = "词库管理", description = "词库查询、管理等相关接口")
public class DictionaryController {
    
    private final DictionaryService dictionaryService;
    private final JwtUtil jwtUtil;
    
    @GetMapping
    @Operation(summary = "获取所有词库", description = "获取系统中所有可用的词库")
    public ApiResponse<List<DictionaryResponse>> getAllDictionaries() {
        List<DictionaryResponse> dictionaries = dictionaryService.getAllDictionaries();
        return ApiResponse.success(dictionaries);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取词库详情", description = "根据词库ID获取词库详细信息")
    public ApiResponse<DictionaryResponse> getDictionaryById(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id) {
        DictionaryResponse dictionary = dictionaryService.getDictionaryById(id);
        return ApiResponse.success(dictionary);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "根据分类获取词库", description = "根据分类获取词库列表")
    public ApiResponse<List<DictionaryResponse>> getDictionariesByCategory(
            @Parameter(description = "分类名称", required = true)
            @PathVariable String category) {
        List<DictionaryResponse> dictionaries = dictionaryService.getDictionariesByCategory(category);
        return ApiResponse.success(dictionaries);
    }
    
    @GetMapping("/popular")
    @Operation(summary = "获取热门词库", description = "获取热门词库列表")
    public ApiResponse<List<DictionaryResponse>> getPopularDictionaries(
            @Parameter(description = "最大数量，默认10")
            @RequestParam(defaultValue = "10") int limit) {
        List<DictionaryResponse> dictionaries = dictionaryService.getPopularDictionaries(limit);
        return ApiResponse.success(dictionaries);
    }
    
    @GetMapping("/{id}/progress")
    @Operation(summary = "获取词库学习进度", description = "获取当前用户在指定词库的学习进度")
    public ApiResponse<DictionaryResponse> getDictionaryWithProgress(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        DictionaryResponse dictionary = dictionaryService.getDictionaryWithProgress(id, userId);
        return ApiResponse.success(dictionary);
    }
    
    @PostMapping
    @Operation(summary = "创建词库", description = "创建新的词库")
    public ApiResponse<DictionaryResponse> createDictionary(@RequestBody Dictionary dictionary) {
        DictionaryResponse response = dictionaryService.createDictionary(dictionary);
        return ApiResponse.success("词库创建成功", response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新词库", description = "更新词库信息")
    public ApiResponse<DictionaryResponse> updateDictionary(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id,
            @RequestBody Dictionary dictionary) {
        DictionaryResponse response = dictionaryService.updateDictionary(id, dictionary);
        return ApiResponse.success("词库更新成功", response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除词库", description = "删除指定词库")
    public ApiResponse<Boolean> deleteDictionary(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id) {
        boolean result = dictionaryService.deleteDictionary(id);
        return ApiResponse.success("词库删除成功", result);
    }
    
    @GetMapping("/{id}/word-count")
    @Operation(summary = "获取词库单词数量", description = "获取词库中的单词数量")
    public ApiResponse<Integer> getWordCount(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id) {
        int wordCount = dictionaryService.getWordCount(id);
        return ApiResponse.success(wordCount);
    }
    
    @PutMapping("/{id}/update-word-count")
    @Operation(summary = "更新词库单词数量", description = "更新词库的单词数量统计")
    public ApiResponse<Boolean> updateWordCount(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long id) {
        boolean result = dictionaryService.updateWordCount(id);
        return ApiResponse.success("单词数量更新成功", result);
    }
}