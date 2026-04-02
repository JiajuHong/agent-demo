package com.wordmaster.service;

import com.wordmaster.dto.response.WordResponse;
import com.wordmaster.entity.Word;

import java.util.List;

public interface WordService {
    
    /**
     * 获取单词详情
     */
    WordResponse getWordDetail(Long wordId);
    
    /**
     * 根据单词查询
     */
    WordResponse getWordByWord(String word);
    
    /**
     * 搜索单词
     */
    List<WordResponse> searchWords(String keyword, int page, int size);
    
    /**
     * 获取随机单词
     */
    List<WordResponse> getRandomWords(int count);
    
    /**
     * 根据词库获取单词
     */
    List<WordResponse> getWordsByDictionary(Long dictionaryId, int page, int size);
    
    /**
     * 根据难度获取单词
     */
    List<WordResponse> getWordsByDifficulty(int difficulty, int limit);
    
    /**
     * 从网易API查询单词
     */
    WordResponse queryWordFromNetease(String word);
    
    /**
     * 保存单词到数据库
     */
    Word saveWord(Word word);
    
    /**
     * 批量保存单词
     */
    int batchSaveWords(List<Word> words);
}