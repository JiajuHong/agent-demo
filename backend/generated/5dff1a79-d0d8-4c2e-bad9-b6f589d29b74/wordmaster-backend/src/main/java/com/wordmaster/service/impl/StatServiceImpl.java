package com.wordmaster.service.impl;

import com.wordmaster.dto.response.StatResponse;
import com.wordmaster.entity.StatRecord;
import com.wordmaster.mapper.StatMapper;
import com.wordmaster.mapper.StudyRecordMapper;
import com.wordmaster.service.StatService;
import com.wordmaster.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatServiceImpl implements StatService {
    
    private final StatMapper statMapper;
    private final StudyRecordMapper studyRecordMapper;
    private final RedisUtil redisUtil;
    
    @Override
    public StatResponse getTodayStat(Long userId) {
        return getStatByDate(userId, LocalDate.now());
    }
    
    @Override
    public StatResponse getStatByDate(Long userId, LocalDate date) {
        // 先从缓存中获取
        String cacheKey = redisUtil.getUserStatKey(userId, date.toString());
        StatResponse cachedResponse = (StatResponse) redisUtil.get(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }
        
        // 从数据库查询
        StatRecord statRecord = statMapper.selectByUserAndDate(userId, date);
        
        StatResponse response;
        if (statRecord != null) {
            response = convertToResponse(statRecord);
        } else {
            // 创建空的统计记录
            response = new StatResponse();
            response.setUserId(userId);
            response.setStatDate(date);
            response.setLearnedCount(0);
            response.setReviewedCount(0);
            response.setTotalTime(0);
        }
        
        // 存入缓存，有效期1小时
        redisUtil.set(cacheKey, response, 1, java.util.concurrent.TimeUnit.HOURS);
        
        return response;
    }
    
    @Override
    public List<StatResponse> getRecentStats(Long userId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        List<StatRecord> statRecords = statMapper.selectByDateRange(userId, startDate, endDate);
        
        // 填充缺失的日期
        Map<LocalDate, StatRecord> recordMap = statRecords.stream()
                .collect(Collectors.toMap(StatRecord::getStatDate, record -> record));
        
        List<StatResponse> responses = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            StatRecord record = recordMap.get(date);
            if (record != null) {
                responses.add(convertToResponse(record));
            } else {
                // 创建空的统计记录
                StatResponse response = new StatResponse();
                response.setUserId(userId);
                response.setStatDate(date);
                response.setLearnedCount(0);
                response.setReviewedCount(0);
                response.setTotalTime(0);
                responses.add(response);
            }
        }
        
        return responses;
    }
    
    @Override
    public List<StatResponse> getMonthlyStats(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<StatRecord> statRecords = statMapper.selectByDateRange(userId, startDate, endDate);
        
        return statRecords.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StatResponse> getYearlyStats(Long userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        List<StatRecord> statRecords = statMapper.selectByDateRange(userId, startDate, endDate);
        
        return statRecords.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> getStudyTrend(Long userId, int days) {
        List<StatRecord> trendData = statMapper.selectTrendData(userId, days);
        
        Map<String, Object> result = new HashMap<>();
        
        // 提取日期和统计数据
        List<String> dates = new ArrayList<>();
        List<Integer> learnedCounts = new ArrayList<>();
        List<Integer> reviewedCounts = new ArrayList<>();
        List<Integer> totalTimes = new ArrayList<>();
        
        for (StatRecord record : trendData) {
            dates.add(record.getStatDate().toString());
            learnedCounts.add(record.getLearnedCount());
            reviewedCounts.add(record.getReviewedCount());
            totalTimes.add(record.getTotalTime());
        }
        
        result.put("dates", dates);
        result.put("learnedCounts", learnedCounts);
        result.put("reviewedCounts", reviewedCounts);
        result.put("totalTimes", totalTimes);
        
        // 计算统计数据
        int totalLearned = learnedCounts.stream().mapToInt(Integer::intValue).sum();
        int totalReviewed = reviewedCounts.stream().mapToInt(Integer::intValue).sum();
        int totalTime = totalTimes.stream().mapToInt(Integer::intValue).sum();
        
        result.put("totalLearned", totalLearned);
        result.put("totalReviewed", totalReviewed);
        result.put("totalTime", totalTime);
        
        // 计算平均数据
        if (!trendData.isEmpty()) {
            result.put("avgLearned", totalLearned / trendData.size());
            result.put("avgReviewed", totalReviewed / trendData.size());
            result.put("avgTime", totalTime / trendData.size());
        } else {
            result.put("avgLearned", 0);
            result.put("avgReviewed", 0);
            result.put("avgTime", 0);
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> getStudyOverview(Long userId) {
        Map<String, Object> overview = new HashMap<>();
        
        // 获取今日统计
        StatResponse todayStat = getTodayStat(userId);
        overview.put("today", todayStat);
        
        // 获取最近7天统计
        List<StatResponse> recentStats = getRecentStats(userId, 7);
        overview.put("recentStats", recentStats);
        
        // 计算最近7天总计
        int weeklyLearned = recentStats.stream()
                .mapToInt(StatResponse::getLearnedCount)
                .sum();
        int weeklyReviewed = recentStats.stream()
                .mapToInt(StatResponse::getReviewedCount)
                .sum();
        int weeklyTime = recentStats.stream()
                .mapToInt(StatResponse::getTotalTime)
                .sum();
        
        overview.put("weeklyLearned", weeklyLearned);
        overview.put("weeklyReviewed", weeklyReviewed);
        overview.put("weeklyTime", weeklyTime);
        
        // 获取总统计
        overview.put("totalLearned", getTotalLearnedWords(userId));
        overview.put("totalReviewed", getTotalReviewedWords(userId));
        overview.put("totalTime", getTotalStudyTime(userId));
        
        // 获取连续学习天数
        int continuousDays = calculateContinuousDays(userId);
        overview.put("continuousDays", continuousDays);
        
        return overview;
    }
    
    @Override
    @Transactional
    public void updateStudyStat(Long userId, int learnedCount, int reviewedCount, int studyTime) {
        LocalDate today = LocalDate.now();
        
        // 查询今日统计记录
        StatRecord statRecord = statMapper.selectByUserAndDate(userId, today);
        
        if (statRecord == null) {
            // 创建新的统计记录
            statRecord = new StatRecord();
            statRecord.setUserId(userId);
            statRecord.setStatDate(today);
            statRecord.setLearnedCount(learnedCount);
            statRecord.setReviewedCount(reviewedCount);
            statRecord.setTotalTime(studyTime);
            
            statMapper.insert(statRecord);
        } else {
            // 更新现有统计记录
            statRecord.setLearnedCount(statRecord.getLearnedCount() + learnedCount);
            statRecord.setReviewedCount(statRecord.getReviewedCount() + reviewedCount);
            statRecord.setTotalTime(statRecord.getTotalTime() + studyTime);
            
            statMapper.updateById(statRecord);
        }
        
        // 清除缓存
        String cacheKey = redisUtil.getUserStatKey(userId, today.toString());
        redisUtil.delete(cacheKey);
        
        log.debug("更新用户统计: userId={}, date={}, learned={}, reviewed={}, time={}",
                userId, today, learnedCount, reviewedCount, studyTime);
    }
    
    @Override
    @Scheduled(cron = "0 0 0 * * ?") // 每天凌晨执行
    public void dailyStatTask() {
        log.info("开始执行每日统计任务...");
        
        // 这里可以添加需要每日执行的统计任务
        // 例如：清理旧数据、生成报表等
        
        log.info("每日统计任务执行完成");
    }
    
    @Override
    public int getTotalStudyTime(Long userId) {
        return statMapper.sumTotalTime(userId);
    }
    
    @Override
    public int getTotalLearnedWords(Long userId) {
        return statMapper.sumLearnedCount(userId);
    }
    
    @Override
    public int getTotalReviewedWords(Long userId) {
        return statMapper.sumReviewedCount(userId);
    }
    
    /**
     * 计算连续学习天数
     */
    private int calculateContinuousDays(Long userId) {
        LocalDate today = LocalDate.now();
        int continuousDays = 0;
        
        // 从今天开始往前检查
        for (int i = 0; i < 365; i++) { // 最多检查一年
            LocalDate checkDate = today.minusDays(i);
            StatRecord statRecord = statMapper.selectByUserAndDate(userId, checkDate);
            
            if (statRecord != null && 
                (statRecord.getLearnedCount() > 0 || statRecord.getReviewedCount() > 0)) {
                continuousDays++;
            } else {
                break;
            }
        }
        
        return continuousDays;
    }
    
    /**
     * 将StatRecord实体转换为StatResponse
     */
    private StatResponse convertToResponse(StatRecord statRecord) {
        StatResponse response = new StatResponse();
        BeanUtils.copyProperties(statRecord, response);
        return response;
    }
}