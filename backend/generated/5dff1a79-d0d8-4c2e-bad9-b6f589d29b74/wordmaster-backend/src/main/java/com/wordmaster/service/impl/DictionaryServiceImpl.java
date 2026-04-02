package com.wordmaster.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wordmaster.dto.response.DictionaryResponse;
import com.wordmaster.entity.Dictionary;
import com.wordmaster.exception.BusinessException;
import com.wordmaster.mapper.DictionaryMapper;
import com.wordmaster.mapper.StudyRecordMapper;
import com.wordmaster.mapper.WordMapper;
import com.wordmaster.service.DictionaryService;
import com.wordmaster.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryServiceImpl implements DictionaryService {
    
    private final DictionaryMapper dictionaryMapper;
    private final WordMapper wordMapper;
    private final StudyRecordMapper studyRecordMapper;
    private final RedisUtil redisUtil;
    
    @Override
    public List<DictionaryResponse> getAllDictionaries() {
        List<Dictionary> dictionaries = dictionaryMapper.selectAll();
        
        return dictionaries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public DictionaryResponse getDictionaryById(Long dictionaryId) {
        // 先从缓存中获取
        String cacheKey = "dictionary:" + dictionaryId;
        DictionaryResponse cachedResponse = (DictionaryResponse) redisUtil.get(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }
        
        Dictionary dictionary = dictionaryMapper.selectById(dictionaryId);
        if (dictionary == null) {
            return null;
        }
        
        DictionaryResponse response = convertToResponse(dictionary);
        
        // 存入缓存，有效期1小时
        redisUtil.set(cacheKey, response, 1, java.util.concurrent.TimeUnit.HOURS);
        
        return response;
    }
    
    @Override
    public List<DictionaryResponse> getDictionariesByCategory(String category) {
        List<Dictionary> dictionaries = dictionaryMapper.selectByCategory(category);
        
        return dictionaries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DictionaryResponse> getPopularDictionaries(int limit) {
        List<Dictionary> dictionaries = dictionaryMapper.selectPopular(limit);
        
        return dictionaries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public DictionaryResponse getDictionaryWithProgress(Long dictionaryId, Long userId) {
        Dictionary dictionary = dictionaryMapper.selectById(dictionaryId);
        if (dictionary == null) {
            return null;
        }
        
        DictionaryResponse response = convertToResponse(dictionary);
        
        // 计算学习进度
        if (userId != null) {
            int learnedWords = studyRecordMapper.countLearnedWordsByDictionary(userId, dictionaryId);
            response.setLearnedWords(learnedWords);
            
            if (dictionary.getTotalWords() > 0) {
                double progress = (learnedWords * 100.0) / dictionary.getTotalWords();
                response.setProgress(Math.round(progress * 10.0) / 10.0); // 保留一位小数
            } else {
                response.setProgress(0.0);
            }
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public DictionaryResponse createDictionary(Dictionary dictionary) {
        // 检查词库名称是否已存在
        QueryWrapper<Dictionary> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name", dictionary.getName())
                   .eq("deleted", 0);
        
        if (dictionaryMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException(2002, "词库名称已存在");
        }
        
        // 设置默认值
        if (dictionary.getTotalWords() == null) {
            dictionary.setTotalWords(0);
        }
        
        // 保存词库
        int result = dictionaryMapper.insert(dictionary);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("创建词库成功: name={}, id={}", dictionary.getName(), dictionary.getId());
        
        return convertToResponse(dictionary);
    }
    
    @Override
    @Transactional
    public DictionaryResponse updateDictionary(Long dictionaryId, Dictionary updateDictionary) {
        Dictionary dictionary = dictionaryMapper.selectById(dictionaryId);
        if (dictionary == null) {
            throw new BusinessException(2001, "词库不存在");
        }
        
        // 更新词库信息
        if (updateDictionary.getName() != null) {
            dictionary.setName(updateDictionary.getName());
        }
        
        if (updateDictionary.getDescription() != null) {
            dictionary.setDescription(updateDictionary.getDescription());
        }
        
        if (updateDictionary.getCategory() != null) {
            dictionary.setCategory(updateDictionary.getCategory());
        }
        
        if (updateDictionary.getTotalWords() != null) {
            dictionary.setTotalWords(updateDictionary.getTotalWords());
        }
        
        // 保存更新
        int result = dictionaryMapper.updateById(dictionary);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("更新词库成功: id={}, name={}", dictionaryId, dictionary.getName());
        
        // 清除缓存
        String cacheKey = "dictionary:" + dictionaryId;
        redisUtil.delete(cacheKey);
        
        return convertToResponse(dictionary);
    }
    
    @Override
    @Transactional
    public boolean deleteDictionary(Long dictionaryId) {
        Dictionary dictionary = dictionaryMapper.selectById(dictionaryId);
        if (dictionary == null) {
            return false;
        }
        
        // 逻辑删除
        dictionary.setDeleted(1);
        int result = dictionaryMapper.updateById(dictionary);
        
        // 清除缓存
        String cacheKey = "dictionary:" + dictionaryId;
        redisUtil.delete(cacheKey);
        
        return result > 0;
    }
    
    @Override
    public int getWordCount(Long dictionaryId) {
        QueryWrapper<com.wordmaster.entity.Word> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("dictionary_id", dictionaryId)
                   .eq("deleted", 0);
        
        return Math.toIntExact(wordMapper.selectCount(queryWrapper));
    }
    
    @Override
    @Transactional
    public boolean updateWordCount(Long dictionaryId) {
        int wordCount = getWordCount(dictionaryId);
        
        Dictionary dictionary = dictionaryMapper.selectById(dictionaryId);
        if (dictionary == null) {
            return false;
        }
        
        dictionary.setTotalWords(wordCount);
        int result = dictionaryMapper.updateById(dictionary);
        
        // 清除缓存
        String cacheKey = "dictionary:" + dictionaryId;
        redisUtil.delete(cacheKey);
        
        return result > 0;
    }
    
    /**
     * 将Dictionary实体转换为DictionaryResponse
     */
    private DictionaryResponse convertToResponse(Dictionary dictionary) {
        DictionaryResponse response = new DictionaryResponse();
        BeanUtils.copyProperties(dictionary, response);
        response.setLearnedWords(0);
        response.setProgress(0.0);
        return response;
    }
}