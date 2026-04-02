package com.wordmaster.service;

import com.wordmaster.dto.request.StudyRequest;
import com.wordmaster.dto.response.StudyRecordResponse;
import com.wordmaster.entity.StudyRecord;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyService {
    
    /**
     * 学习单词
     */
    StudyRecordResponse learnWord(Long userId, StudyRequest request);
    
    /**
     * 复习单词
     */
    StudyRecordResponse reviewWord(Long userId, StudyRequest request);
    
    /**
     * 获取需要复习的单词列表
     */
    List<StudyRecordResponse> getReviewList(Long userId, int limit);
    
    /**
     * 获取用户学习记录
     */
    List<StudyRecordResponse> getStudyRecords(Long userId, int page, int size);
    
    /**
     * 获取单词学习记录
     */
    StudyRecordResponse getStudyRecord(Long userId, Long wordId);
    
    /**
     * 获取用户今日学习统计
     */
    StudyRecordResponse getTodayStudyStats(Long userId);
    
    /**
     * 获取用户总学习统计
     */
    StudyRecordResponse getTotalStudyStats(Long userId);
    
    /**
     * 获取词库学习进度
     */
    StudyRecordResponse getDictionaryProgress(Long userId, Long dictionaryId);
    
    /**
     * 重置学习记录
     */
    boolean resetStudyRecord(Long userId, Long wordId);
    
    /**
     * 批量学习单词
     */
    List<StudyRecordResponse> batchLearnWords(Long userId, List<StudyRequest> requests);
}