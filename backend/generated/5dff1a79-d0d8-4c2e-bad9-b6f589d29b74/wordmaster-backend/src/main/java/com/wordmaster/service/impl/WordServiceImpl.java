package com.wordmaster.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wordmaster.dto.response.WordResponse;
import com.wordmaster.entity.Dictionary;
import com.wordmaster.entity.Word;
import com.wordmaster.exception.BusinessException;
import com.wordmaster.mapper.DictionaryMapper;
import com.wordmaster.mapper.WordMapper;
import com.wordmaster.service.WordService;
import com.wordmaster.util.NeteaseApiClient;
import com.wordmaster.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WordServiceImpl implements WordService {
    
    private final WordMapper wordMapper;
    private final DictionaryMapper dictionaryMapper;
    private final NeteaseApiClient neteaseApiClient;
    private final RedisUtil redisUtil;
    
    @Override
    public WordResponse getWordDetail(Long wordId) {
        // 先从缓存中获取
        String cacheKey = redisUtil.getWordKey(wordId);
        WordResponse cachedResponse = (WordResponse) redisUtil.get(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }
        
        // 从数据库查询
        Word word = wordMapper.selectById(wordId);
        if (word == null) {
            throw BusinessException.wordNotFound();
        }
        
        WordResponse response = convertToResponse(word);
        
        // 存入缓存，有效期1小时
        redisUtil.set(cacheKey, response, 1, java.util.concurrent.TimeUnit.HOURS);
        
        return response;
    }
    
    @Override
    public WordResponse getWordByWord(String wordStr) {
        Word word = wordMapper.selectByWord(wordStr);
        if (word == null) {
            // 如果本地数据库没有，从网易API查询
            return queryWordFromNetease(wordStr);
        }
        
        return convertToResponse(word);
    }
    
    @Override
    public List<WordResponse> searchWords(String keyword, int page, int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // 创建分页对象
        Page<Word> pageParam = new Page<>(page, size);
        QueryWrapper<Word> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("word", keyword)
                   .eq("deleted", 0)
                   .orderByAsc("word");
        
        // 执行查询
        Page<Word> wordPage = wordMapper.selectPage(pageParam, queryWrapper);
        
        // 转换为响应对象
        return wordPage.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WordResponse> getRandomWords(int count) {
        List<Word> words = wordMapper.selectRandomWords(count);
        return words.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WordResponse> getWordsByDictionary(Long dictionaryId, int page, int size) {
        // 创建分页对象
        Page<Word> pageParam = new Page<>(page, size);
        QueryWrapper<Word> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("dictionary_id", dictionaryId)
                   .eq("deleted", 0)
                   .orderByAsc("word");
        
        // 执行查询
        Page<Word> wordPage = wordMapper.selectPage(pageParam, queryWrapper);
        
        // 转换为响应对象
        return wordPage.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WordResponse> getWordsByDifficulty(int difficulty, int limit) {
        List<Word> words = wordMapper.selectByDifficulty(difficulty, limit);
        return words.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public WordResponse queryWordFromNetease(String word) {
        log.info("从网易API查询单词: {}", word);
        
        WordResponse response = neteaseApiClient.queryWord(word);
        
        // 保存到数据库
        Word wordEntity = new Word();
        wordEntity.setWord(response.getWord());
        wordEntity.setPhonetic(response.getPhonetic());
        wordEntity.setDefinition(response.getDefinition());
        wordEntity.setExample(response.getExample());
        wordEntity.setDifficulty(response.getDifficulty());
        
        // 默认保存到四级词库
        Dictionary defaultDictionary = dictionaryMapper.selectById(1L);
        if (defaultDictionary != null) {
            wordEntity.setDictionaryId(defaultDictionary.getId());
        }
        
        saveWord(wordEntity);
        
        return response;
    }
    
    @Override
    @Transactional
    public Word saveWord(Word word) {
        // 检查单词是否已存在
        Word existingWord = wordMapper.selectByWord(word.getWord());
        if (existingWord != null) {
            return existingWord;
        }
        
        // 保存单词
        int result = wordMapper.insert(word);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("单词保存成功: word={}, id={}", word.getWord(), word.getId());
        
        return word;
    }
    
    @Override
    @Transactional
    public int batchSaveWords(List<Word> words) {
        int successCount = 0;
        
        for (Word word : words) {
            try {
                saveWord(word);
                successCount++;
            } catch (Exception e) {
                log.error("保存单词失败: {}", word.getWord(), e);
            }
        }
        
        log.info("批量保存单词完成: 总数={}, 成功={}", words.size(), successCount);
        return successCount;
    }
    
    /**
     * 将Word实体转换为WordResponse
     */
    private WordResponse convertToResponse(Word word) {
        WordResponse response = new WordResponse();
        BeanUtils.copyProperties(word, response);
        
        // 查询词库名称
        if (word.getDictionaryId() != null) {
            Dictionary dictionary = dictionaryMapper.selectById(word.getDictionaryId());
            if (dictionary != null) {
                response.setDictionaryName(dictionary.getName());
            }
        }
        
        return response;
    }
}