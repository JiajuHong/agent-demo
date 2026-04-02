package com.wordmaster.controller;

import com.wordmaster.dto.request.StudyRequest;
import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.StudyRecordResponse;
import com.wordmaster.service.StudyService;
import com.wordmaster.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study")
@RequiredArgsConstructor
@Tag(name = "学习管理", description = "单词学习、复习等相关接口")
public class StudyController {
    
    private final StudyService studyService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/learn")
    @Operation(summary = "学习单词", description = "记录单词学习情况")
    public ApiResponse<StudyRecordResponse> learnWord(
            @Valid @RequestBody StudyRequest request,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse response = studyService.learnWord(userId, request);
        return ApiResponse.success("学习记录保存成功", response);
    }
    
    @PostMapping("/review")
    @Operation(summary = "复习单词", description = "记录单词复习情况")
    public ApiResponse<StudyRecordResponse> reviewWord(
            @Valid @RequestBody StudyRequest request,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse response = studyService.reviewWord(userId, request);
        return ApiResponse.success("复习记录保存成功", response);
    }
    
    @GetMapping("/review-list")
    @Operation(summary = "获取复习列表", description = "获取需要复习的单词列表")
    public ApiResponse<List<StudyRecordResponse>> getReviewList(
            HttpServletRequest httpRequest,
            @Parameter(description = "最大数量，默认20")
            @RequestParam(defaultValue = "20") int limit) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StudyRecordResponse> reviewList = studyService.getReviewList(userId, limit);
        return ApiResponse.success(reviewList);
    }
    
    @GetMapping("/records")
    @Operation(summary = "获取学习记录", description = "获取用户的学习记录")
    public ApiResponse<List<StudyRecordResponse>> getStudyRecords(
            HttpServletRequest httpRequest,
            @Parameter(description = "页码，默认1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小，默认10")
            @RequestParam(defaultValue = "10") int size) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StudyRecordResponse> records = studyService.getStudyRecords(userId, page, size);
        return ApiResponse.success(records);
    }
    
    @GetMapping("/records/{wordId}")
    @Operation(summary = "获取单词学习记录", description = "获取指定单词的学习记录")
    public ApiResponse<StudyRecordResponse> getStudyRecord(
            @Parameter(description = "单词ID", required = true)
            @PathVariable Long wordId,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse record = studyService.getStudyRecord(userId, wordId);
        if (record == null) {
            return ApiResponse.success(null);
        }
        return ApiResponse.success(record);
    }
    
    @GetMapping("/today-stats")
    @Operation(summary = "获取今日学习统计", description = "获取用户今日学习统计数据")
    public ApiResponse<StudyRecordResponse> getTodayStudyStats(HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse stats = studyService.getTodayStudyStats(userId);
        return ApiResponse.success(stats);
    }
    
    @GetMapping("/total-stats")
    @Operation(summary = "获取总学习统计", description = "获取用户总学习统计数据")
    public ApiResponse<StudyRecordResponse> getTotalStudyStats(HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse stats = studyService.getTotalStudyStats(userId);
        return ApiResponse.success(stats);
    }
    
    @GetMapping("/dictionary-progress/{dictionaryId}")
    @Operation(summary = "获取词库学习进度", description = "获取用户在指定词库的学习进度")
    public ApiResponse<StudyRecordResponse> getDictionaryProgress(
            @Parameter(description = "词库ID", required = true)
            @PathVariable Long dictionaryId,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StudyRecordResponse progress = studyService.getDictionaryProgress(userId, dictionaryId);
        return ApiResponse.success(progress);
    }
    
    @DeleteMapping("/records/{wordId}")
    @Operation(summary = "重置学习记录", description = "重置指定单词的学习记录")
    public ApiResponse<Boolean> resetStudyRecord(
            @Parameter(description = "单词ID", required = true)
            @PathVariable Long wordId,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        boolean result = studyService.resetStudyRecord(userId, wordId);
        return ApiResponse.success("重置成功", result);
    }
    
    @PostMapping("/batch-learn")
    @Operation(summary = "批量学习单词", description = "批量记录单词学习情况")
    public ApiResponse<List<StudyRecordResponse>> batchLearnWords(
            @Valid @RequestBody List<StudyRequest> requests,
            HttpServletRequest httpRequest) {
        String token = jwtUtil.getTokenFromHeader(httpRequest.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StudyRecordResponse> responses = studyService.batchLearnWords(userId, requests);
        return ApiResponse.success("批量学习完成", responses);
    }
}