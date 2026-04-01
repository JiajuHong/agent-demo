package com.wordmaster.service;

import com.wordmaster.model.dto.LearningRecordDTO;
import com.wordmaster.model.entity.LearningRecord;
import com.wordmaster.model.entity.User;
import com.wordmaster.model.entity.Word;
import com.wordmaster.repository.LearningRecordRepository;
import com.wordmaster.repository.UserRepository;
import com.wordmaster.repository.WordRepository;
import com.wordmaster.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LearningService {

    @Autowired
    private LearningRecordRepository learningRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private UserService userService;

    private static final double INITIAL_EASINESS_FACTOR = 2.5;
    private static final int MASTERY_THRESHOLD = 5;

    public LearningRecordDTO getLearningRecord(Long userId, Long wordId) {
        LearningRecord record = learningRecordRepository.findByUserIdAndWordId(userId, wordId)
                .orElseThrow(() -> new RuntimeException("学习记录不存在"));
        
        return convertToDTO(record);
    }

    public List<LearningRecordDTO> getLearningRecordsByUser(Long userId) {
        List<LearningRecord> records = learningRecordRepository.findByUserId(userId);
        return records.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<LearningRecordDTO> getLearningRecordsByUser(Long userId, Pageable pageable) {
        return learningRecordRepository.findByUserId(userId, pageable)
                .map(this::convertToDTO);
    }

    public List<LearningRecordDTO> getDueForReview(Long userId) {
        List<LearningRecord> records = learningRecordRepository.findDueForReview(userId, LocalDateTime.now());
        return records.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LearningRecordDTO> getPendingReview(Long userId, Integer limit) {
        Pageable pageable = Pageable.ofSize(limit);
        List<LearningRecord> records = learningRecordRepository.findPendingReview(userId, pageable);
        return records.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LearningRecordDTO startLearningWord(Long wordId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        
        Long userId = userDetails.getId();
        
        // 检查是否已存在学习记录
        Optional<LearningRecord> existingRecord = learningRecordRepository.findByUserIdAndWordId(userId, wordId);
        if (existingRecord.isPresent()) {
            return convertToDTO(existingRecord.get());
        }
        
        // 获取用户和单词
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("单词不存在"));
        
        // 创建新的学习记录
        LearningRecord record = LearningRecord.builder()
                .user(user)
                .word(word)
                .masteryLevel(0)
                .reviewCount(0)
                .correctCount(0)
                .wrongCount(0)
                .easinessFactor(INITIAL_EASINESS_FACTOR)
                .intervalDays(1)
                .isMastered(false)
                .nextReviewAt(LocalDateTime.now().plusDays(1))
                .build();
        
        record = learningRecordRepository.save(record);
        
        // 更新用户学习统计
        userService.updateLearningStats(userId, false);
        
        return convertToDTO(record);
    }

    @Transactional
    public LearningRecordDTO reviewWord(Long recordId, boolean isCorrect) {
        LearningRecord record = learningRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("学习记录不存在"));
        
        LocalDateTime now = LocalDateTime.now();
        
        // 计算新的间隔和易度因子（基于SM-2算法）
        double easinessFactor = calculateEasinessFactor(record.getEasinessFactor(), isCorrect);
        int intervalDays = calculateInterval(record.getIntervalDays(), easinessFactor, isCorrect);
        
        LocalDateTime nextReviewAt = now.plusDays(intervalDays);
        
        if (isCorrect) {
            // 正确答案
            learningRecordRepository.updateForCorrectAnswer(
                recordId,
                now,
                nextReviewAt,
                easinessFactor,
                intervalDays,
                MASTERY_THRESHOLD
            );
            
            // 检查是否达到掌握级别
            boolean isMastered = record.getMasteryLevel() + 1 >= MASTERY_THRESHOLD;
            if (isMastered) {
                userService.updateLearningStats(record.getUser().getId(), true);
            }
        } else {
            // 错误答案
            learningRecordRepository.updateForWrongAnswer(
                recordId,
                now,
                nextReviewAt,
                easinessFactor,
                intervalDays
            );
        }
        
        // 更新用户连续学习天数
        userService.updateStreak(record.getUser().getId());
        
        // 返回更新后的记录
        record = learningRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("学习记录不存在"));
        
        return convertToDTO(record);
    }

    private double calculateEasinessFactor(double currentEasiness, boolean isCorrect) {
        double newEasiness = currentEasiness + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02));
        
        if (isCorrect) {
            newEasiness = Math.max(1.3, newEasiness);
        } else {
            newEasiness = Math.max(1.3, currentEasiness - 0.2);
        }
        
        return newEasiness;
    }

    private int calculateInterval(int currentInterval, double easinessFactor, boolean isCorrect) {
        if (!isCorrect) {
            return 1; // 错误答案，明天复习
        }
        
        if (currentInterval == 1) {
            return 6; // 第一次正确，6天后复习
        } else {
            return (int) Math.round(currentInterval * easinessFactor);
        }
    }

    public Long countMasteredWords(Long userId) {
        return learningRecordRepository.countMasteredWords(userId);
    }

    private LearningRecordDTO convertToDTO(LearningRecord record) {
        return LearningRecordDTO.builder()
                .id(record.getId())
                .masteryLevel(record.getMasteryLevel())
                .reviewCount(record.getReviewCount())
                .correctCount(record.getCorrectCount())
                .wrongCount(record.getWrongCount())
                .lastReviewAt(record.getLastReviewAt())
                .nextReviewAt(record.getNextReviewAt())
                .easinessFactor(record.getEasinessFactor())
                .intervalDays(record.getIntervalDays())
                .isMastered(record.getIsMastered())
                .userId(record.getUser().getId())
                .wordId(record.getWord().getId())
                .word(record.getWord().getWord())
                .definition(record.getWord().getDefinition())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}