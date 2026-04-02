package com.wordmaster.service;

import com.wordmaster.dto.response.DictionaryResponse;
import com.wordmaster.entity.Dictionary;

import java.util.List;

public interface DictionaryService {
    
    /**
     * 获取所有词库
     */
    List<DictionaryResponse> getAllDictionaries();
    
    /**
     * 根据ID获取词库
     */
    DictionaryResponse getDictionaryById(Long dictionaryId);
    
    /**
     * 根据分类获取词库
     */
    List<DictionaryResponse> getDictionariesByCategory(String category);
    
    /**
     * 获取热门词库
     */
    List<DictionaryResponse> getPopularDictionaries(int limit);
    
    /**
     * 获取用户词库学习进度
     */
    DictionaryResponse getDictionaryWithProgress(Long dictionaryId, Long userId);
    
    /**
     * 创建词库
     */
    DictionaryResponse createDictionary(Dictionary dictionary);
    
    /**
     * 更新词库
     */
    DictionaryResponse updateDictionary(Long dictionaryId, Dictionary dictionary);
    
    /**
     * 删除词库
     */
    boolean deleteDictionary(Long dictionaryId);
    
    /**
     * 获取词库中的单词数量
     */
    int getWordCount(Long dictionaryId);
    
    /**
     * 更新词库单词数量
     */
    boolean updateWordCount(Long dictionaryId);
}