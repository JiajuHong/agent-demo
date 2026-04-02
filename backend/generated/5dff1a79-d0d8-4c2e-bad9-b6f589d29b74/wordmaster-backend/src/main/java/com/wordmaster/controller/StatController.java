package com.wordmaster.controller;

import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.StatResponse;
import com.wordmaster.service.StatService;
import com.wordmaster.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "统计管理", description = "学习统计、数据分析等相关接口")
public class StatController {
    
    private final StatService statService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/today")
    @Operation(summary = "获取今日统计", description = "获取用户今日学习统计数据")
    public ApiResponse<StatResponse> getTodayStat(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        StatResponse stat = statService.getTodayStat(userId);
        return ApiResponse.success(stat);
    }
    
    @GetMapping("/date/{date}")
    @Operation(summary = "获取指定日期统计", description = "获取用户指定日期的学习统计数据")
    public ApiResponse<StatResponse> getStatByDate(
            @Parameter(description = "日期（格式：yyyy-MM-dd）", required = true)
            @PathVariable String date,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        LocalDate localDate = LocalDate.parse(date);
        StatResponse stat = statService.getStatByDate(userId, localDate);
        return ApiResponse.success(stat);
    }
    
    @GetMapping("/recent/{days}")
    @Operation(summary = "获取最近N天统计", description = "获取用户最近N天的学习统计数据")
    public ApiResponse<List<StatResponse>> getRecentStats(
            @Parameter(description = "天数", required = true)
            @PathVariable int days,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StatResponse> stats = statService.getRecentStats(userId, days);
        return ApiResponse.success(stats);
    }
    
    @GetMapping("/monthly/{year}/{month}")
    @Operation(summary = "获取月度统计", description = "获取用户指定月份的学习统计数据")
    public ApiResponse<List<StatResponse>> getMonthlyStats(
            @Parameter(description = "年份", required = true)
            @PathVariable int year,
            @Parameter(description = "月份（1-12）", required = true)
            @PathVariable int month,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StatResponse> stats = statService.getMonthlyStats(userId, year, month);
        return ApiResponse.success(stats);
    }
    
    @GetMapping("/yearly/{year}")
    @Operation(summary = "获取年度统计", description = "获取用户指定年份的学习统计数据")
    public ApiResponse<List<StatResponse>> getYearlyStats(
            @Parameter(description = "年份", required = true)
            @PathVariable int year,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        List<StatResponse> stats = statService.getYearlyStats(userId, year);
        return ApiResponse.success(stats);
    }
    
    @GetMapping("/trend/{days}")
    @Operation(summary = "获取学习趋势", description = "获取用户最近N天的学习趋势数据")
    public ApiResponse<Map<String, Object>> getStudyTrend(
            @Parameter(description = "天数", required = true)
            @PathVariable int days,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Map<String, Object> trendData = statService.getStudyTrend(userId, days);
        return ApiResponse.success(trendData);
    }
    
    @GetMapping("/overview")
    @Operation(summary = "获取学习概况", description = "获取用户学习概况数据")
    public ApiResponse<Map<String, Object>> getStudyOverview(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Map<String, Object> overview = statService.getStudyOverview(userId);
        return ApiResponse.success(overview);
    }
    
    @GetMapping("/total-time")
    @Operation(summary = "获取总学习时间", description = "获取用户总学习时间（分钟）")
    public ApiResponse<Integer> getTotalStudyTime(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        int totalTime = statService.getTotalStudyTime(userId);
        return ApiResponse.success(totalTime);
    }
    
    @GetMapping("/total-learned")
    @Operation(summary = "获取总学习单词数", description = "获取用户总学习单词数")
    public ApiResponse<Integer> getTotalLearnedWords(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        int totalLearned = statService.getTotalLearnedWords(userId);
        return ApiResponse.success(totalLearned);
    }
    
    @GetMapping("/total-reviewed")
    @Operation(summary = "获取总复习单词数", description = "获取用户总复习单词数")
    public ApiResponse<Integer> getTotalReviewedWords(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        int totalReviewed = statService.getTotalReviewedWords(userId);
        return ApiResponse.success(totalReviewed);
    }
}