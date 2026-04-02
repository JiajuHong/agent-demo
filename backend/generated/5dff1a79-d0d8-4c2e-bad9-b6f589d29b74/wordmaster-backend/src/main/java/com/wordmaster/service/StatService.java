package com.wordmaster.service;

import com.wordmaster.dto.response.StatResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StatService {
    
    /**
     * 获取今日统计
     */
    StatResponse getTodayStat(Long userId);
    
    /**
     * 获取指定日期统计
     */
    StatResponse getStatByDate(Long userId, LocalDate date);
    
    /**
     * 获取最近N天统计
     */
    List<StatResponse> getRecentStats(Long userId, int days);
    
    /**
     * 获取月度统计
     */
    List<StatResponse> getMonthlyStats(Long userId, int year, int month);
    
    /**
     * 获取年度统计
     */
    List<StatResponse> getYearlyStats(Long userId, int year);
    
    /**
     * 获取学习趋势数据
     */
    Map<String, Object> getStudyTrend(Long userId, int days);
    
    /**
     * 获取学习概况
     */
    Map<String, Object> getStudyOverview(Long userId);
    
    /**
     * 更新学习统计
     */
    void updateStudyStat(Long userId, int learnedCount, int reviewedCount, int studyTime);
    
    /**
     * 每日统计任务
     */
    void dailyStatTask();
    
    /**
     * 获取用户总学习时间
     */
    int getTotalStudyTime(Long userId);
    
    /**
     * 获取用户总学习单词数
     */
    int getTotalLearnedWords(Long userId);
    
    /**
     * 获取用户总复习单词数
     */
    int getTotalReviewedWords(Long userId);
}