package com.wordmaster.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wordmaster.dto.request.StudyRequest;
import com.wordmaster.dto.response.StudyRecordResponse;
import com.wordmaster.dto.response.WordResponse;
import com.wordmaster.entity.StudyRecord;
import com.wordmaster.entity.Word;
import com.wordmaster.exception.BusinessException;
import com.wordmaster.mapper.StudyRecordMapper;
import com.wordmaster.mapper.WordMapper;
import com.wordmaster.service.StudyService;
import com.wordmaster.service.WordService;
import com.wordmaster.util.ForgettingCurveUtil;
import com.wordmaster.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudyServiceImpl implements StudyService {
    
    private final StudyRecordMapper studyRecordMapper;
    private final WordMapper wordMapper;
    private final WordService wordService;
    private final ForgettingCurveUtil forgettingCurveUtil;
    private final RedisUtil redisUtil;
    
    @Override
    @Transactional
    public StudyRecordResponse learnWord(Long userId, StudyRequest request) {
        // 验证单词是否存在
        Word word = wordMapper.selectById(request.getWordId());
        if (word == null) {
            throw BusinessException.wordNotFound();
        }
        
        // 检查是否已有学习记录
        StudyRecord existingRecord = studyRecordMapper.selectByUserAndWord(userId, request.getWordId());
        
        StudyRecord studyRecord;
        if (existingRecord != null) {
            // 更新现有记录
            studyRecord = existingRecord;
            studyRecord.setMasteryLevel(request.getMastery());
            studyRecord.setLastReviewTime(LocalDateTime.now());
            studyRecord.setReviewCount(studyRecord.getReviewCount() + 1);
            
            // 计算下次复习时间
            int intervalHours = forgettingCurveUtil.calculateNextReviewInterval(
                request.getMastery(), 
                studyRecord.getReviewCount()
            );
            studyRecord.setNextReviewTime(LocalDateTime.now().plusHours(intervalHours));
            
            // 更新记录
            int result = studyRecordMapper.updateById(studyRecord);
            if (result <= 0) {
                throw BusinessException.systemError();
            }
            
            log.info("更新学习记录: userId={}, wordId={}, mastery={}", 
                    userId, request.getWordId(), request.getMastery());
        } else {
            // 创建新记录
            studyRecord = new StudyRecord();
            studyRecord.setUserId(userId);
            studyRecord.setWordId(request.getWordId());
            studyRecord.setMasteryLevel(request.getMastery());
            studyRecord.setLastReviewTime(LocalDateTime.now());
            studyRecord.setReviewCount(1);
            studyRecord.setCreatedTime(LocalDateTime.now());
            
            // 计算下次复习时间
            int intervalHours = forgettingCurveUtil.calculateNextReviewInterval(
                request.getMastery(), 
                1
            );
            studyRecord.setNextReviewTime(LocalDateTime.now().plusHours(intervalHours));
            
            // 保存记录
            int result = studyRecordMapper.insert(studyRecord);
            if (result <= 0) {
                throw BusinessException.systemError();
            }
            
            log.info("创建学习记录: userId={}, wordId={}, mastery={}", 
                    userId, request.getWordId(), request.getMastery());
        }
        
        // 清除缓存
        String cacheKey = redisUtil.getStudyRecordKey(userId, request.getWordId());
        redisUtil.delete(cacheKey);
        
        // 更新统计
        updateStatistics(userId);
        
        return convertToResponse(studyRecord);
    }
    
    @Override
    @Transactional
    public StudyRecordResponse reviewWord(Long userId, StudyRequest request) {
        // 检查学习记录是否存在
        StudyRecord studyRecord = studyRecordMapper.selectByUserAndWord(userId, request.getWordId());
        if (studyRecord == null) {
            throw BusinessException.studyRecordNotFound();
        }
        
        // 更新掌握程度
        studyRecord.setMasteryLevel(request.getMastery());
        studyRecord.setLastReviewTime(LocalDateTime.now());
        studyRecord.setReviewCount(studyRecord.getReviewCount() + 1);
        
        // 计算下次复习时间
        int intervalHours = forgettingCurveUtil.calculateNextReviewInterval(
            request.getMastery(), 
            studyRecord.getReviewCount()
        );
        studyRecord.setNextReviewTime(LocalDateTime.now().plusHours(intervalHours));
        
        // 更新记录
        int result = studyRecordMapper.updateById(studyRecord);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("复习单词: userId={}, wordId={}, mastery={}", 
                userId, request.getWordId(), request.getMastery());
        
        // 清除缓存
        String cacheKey = redisUtil.getStudyRecordKey(userId, request.getWordId());
        redisUtil.delete(cacheKey);
        
        // 更新统计
        updateStatistics(userId);
        
        return convertToResponse(studyRecord);
    }
    
    @Override
    public List<StudyRecordResponse> getReviewList(Long userId, int limit) {
        // 从数据库查询需要复习的单词
        List<StudyRecord> studyRecords = studyRecordMapper.selectReviewList(
            userId, LocalDateTime.now(), limit
        );
        
        return studyRecords.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StudyRecordResponse> getStudyRecords(Long userId, int page, int size) {
        // 创建分页对象
        Page<StudyRecord> pageParam = new Page<>(page, size);
        QueryWrapper<StudyRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("deleted", 0)
                   .orderByDesc("last_review_time");
        
        // 执行查询
        Page<StudyRecord> recordPage = studyRecordMapper.selectPage(pageParam, queryWrapper);
        
        // 转换为响应对象
        return recordPage.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public StudyRecordResponse getStudyRecord(Long userId, Long wordId) {
        // 先从缓存中获取
        String cacheKey = redisUtil.getStudyRecordKey(userId, wordId);
        StudyRecordResponse cachedResponse = (StudyRecordResponse) redisUtil.get(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }
        
        // 从数据库查询
        StudyRecord studyRecord = studyRecordMapper.selectByUserAndWord(userId, wordId);
        if (studyRecord == null) {
            return null;
        }
        
        StudyRecordResponse response = convertToResponse(studyRecord);
        
        // 存入缓存，有效期30分钟
        redisUtil.set(cacheKey, response, 30, java.util.concurrent.TimeUnit.MINUTES);
        
        return response;
    }
    
    @Override
    public StudyRecordResponse getTodayStudyStats(Long userId) {
        StudyRecordResponse response = new StudyRecordResponse();
        
        // 获取今日学习单词数
        int learnedCount = studyRecordMapper.countTodayLearnedWords(userId);
        response.setReviewCount(learnedCount);
        
        // 获取今日复习单词数
        int reviewedCount = studyRecordMapper.countTodayReviewedWords(userId);
        response.setMasteryLevel(reviewedCount);
        
        return response;
    }
    
    @Override
    public StudyRecordResponse getTotalStudyStats(Long userId) {
        StudyRecordResponse response = new StudyRecordResponse();
        
        // 获取总学习单词数
        int totalLearned = studyRecordMapper.countLearnedWords(userId);
        response.setReviewCount(totalLearned);
        
        return response;
    }
    
    @Override
    public StudyRecordResponse getDictionaryProgress(Long userId, Long dictionaryId) {
        StudyRecordResponse response = new StudyRecordResponse();
        
        // 获取词库学习进度
        int learnedCount = studyRecordMapper.countLearnedWordsByDictionary(userId, dictionaryId);
        response.setReviewCount(learnedCount);
        
        return response;
    }
    
    @Override
    @Transactional
    public boolean resetStudyRecord(Long userId, Long wordId) {
        StudyRecord studyRecord = studyRecordMapper.selectByUserAndWord(userId, wordId);
        if (studyRecord == null) {
            return false;
        }
        
        // 重置学习记录
        studyRecord.setMasteryLevel(1);
        studyRecord.setReviewCount(0);
        studyRecord.setLastReviewTime(LocalDateTime.now());
        studyRecord.setNextReviewTime(LocalDateTime.now().plusHours(1));
        
        int result = studyRecordMapper.updateById(studyRecord);
        
        // 清除缓存
        String cacheKey = redisUtil.getStudyRecordKey(userId, wordId);
        redisUtil.delete(cacheKey);
        
        return result > 0;
    }
    
    @Override
    @Transactional
    public List<StudyRecordResponse> batchLearnWords(Long userId, List<StudyRequest> requests) {
        List<StudyRecordResponse> responses = new ArrayList<>();
        
        for (StudyRequest request : requests) {
            try {
                StudyRecordResponse response = learnWord(userId, request);
                responses.add(response);
            } catch (Exception e) {
                log.error("批量学习单词失败: userId={}, wordId={}", userId, request.getWordId(), e);
            }
        }
        
        return responses;
    }
    
    /**
     * 更新用户学习统计
     */
    private void updateStatistics(Long userId) {
        // 这里可以调用统计服务更新统计信息
        // 在实际项目中，这里应该调用统计服务的方法
        log.debug("更新用户统计: userId={}", userId);
    }
    
    /**
     * 将StudyRecord实体转换为StudyRecordResponse
     */
    private StudyRecordResponse convertToResponse(StudyRecord studyRecord) {
        StudyRecordResponse response = new StudyRecordResponse();
        BeanUtils.copyProperties(studyRecord, response);
        
        // 获取单词信息
        Word word = wordMapper.selectById(studyRecord.getWordId());
        if (word != null) {
            response.setWord(word.getWord());
        }
        
        return response;
    }
}