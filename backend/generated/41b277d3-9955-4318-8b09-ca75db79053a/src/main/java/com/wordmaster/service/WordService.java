package com.wordmaster.service;

import com.wordmaster.model.dto.WordDTO;
import com.wordmaster.model.entity.Word;
import com.wordmaster.model.entity.WordBook;
import com.wordmaster.repository.WordBookRepository;
import com.wordmaster.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WordService {

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private WordBookRepository wordBookRepository;

    public WordDTO getWordById(Long wordId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("单词不存在"));
        
        return convertToDTO(word);
    }

    public List<WordDTO> getWordsByBookId(Long bookId) {
        List<Word> words = wordRepository.findByWordBookId(bookId);
        return words.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<WordDTO> getWordsByBookId(Long bookId, Pageable pageable) {
        return wordRepository.findByWordBookId(bookId, pageable)
                .map(this::convertToDTO);
    }

    public List<WordDTO> getRandomWordsByBookId(Long bookId, Integer limit) {
        List<Word> words = wordRepository.findRandomWordsByBookId(bookId, limit);
        return words.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<WordDTO> getWordsByDifficultyRange(Long bookId, Integer minDifficulty, Integer maxDifficulty) {
        List<Word> words = wordRepository.findByBookIdAndDifficultyRange(bookId, minDifficulty, maxDifficulty);
        return words.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WordDTO createWord(WordDTO wordDTO) {
        WordBook wordBook = wordBookRepository.findById(wordDTO.getWordBookId())
                .orElseThrow(() -> new RuntimeException("单词库不存在"));

        Word word = Word.builder()
                .word(wordDTO.getWord())
                .phoneticSymbol(wordDTO.getPhoneticSymbol())
                .definition(wordDTO.getDefinition())
                .example(wordDTO.getExample())
                .partOfSpeech(wordDTO.getPartOfSpeech())
                .difficulty(wordDTO.getDifficulty() != null ? wordDTO.getDifficulty() : 1)
                .frequencyRank(wordDTO.getFrequencyRank())
                .imageUrl(wordDTO.getImageUrl())
                .audioUrl(wordDTO.getAudioUrl())
                .wordBook(wordBook)
                .isActive(true)
                .build();

        word = wordRepository.save(word);
        
        // 更新单词库的总单词数
        wordBookRepository.updateTotalWords(wordBook.getId());
        
        return convertToDTO(word);
    }

    @Transactional
    public WordDTO updateWord(Long wordId, WordDTO wordDTO) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("单词不存在"));

        if (wordDTO.getWord() != null) {
            word.setWord(wordDTO.getWord());
        }
        if (wordDTO.getPhoneticSymbol() != null) {
            word.setPhoneticSymbol(wordDTO.getPhoneticSymbol());
        }
        if (wordDTO.getDefinition() != null) {
            word.setDefinition(wordDTO.getDefinition());
        }
        if (wordDTO.getExample() != null) {
            word.setExample(wordDTO.getExample());
        }
        if (wordDTO.getPartOfSpeech() != null) {
            word.setPartOfSpeech(wordDTO.getPartOfSpeech());
        }
        if (wordDTO.getDifficulty() != null) {
            word.setDifficulty(wordDTO.getDifficulty());
        }
        if (wordDTO.getFrequencyRank() != null) {
            word.setFrequencyRank(wordDTO.getFrequencyRank());
        }
        if (wordDTO.getImageUrl() != null) {
            word.setImageUrl(wordDTO.getImageUrl());
        }
        if (wordDTO.getAudioUrl() != null) {
            word.setAudioUrl(wordDTO.getAudioUrl());
        }

        word = wordRepository.save(word);
        return convertToDTO(word);
    }

    @Transactional
    public void deleteWord(Long wordId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("单词不存在"));
        
        word.setIsActive(false);
        wordRepository.save(word);
        
        // 更新单词库的总单词数
        wordBookRepository.updateTotalWords(word.getWordBook().getId());
    }

    public Long countActiveWordsByBookId(Long bookId) {
        return wordRepository.countActiveWordsByBookId(bookId);
    }

    private WordDTO convertToDTO(Word word) {
        return WordDTO.builder()
                .id(word.getId())
                .word(word.getWord())
                .phoneticSymbol(word.getPhoneticSymbol())
                .definition(word.getDefinition())
                .example(word.getExample())
                .partOfSpeech(word.getPartOfSpeech())
                .difficulty(word.getDifficulty())
                .frequencyRank(word.getFrequencyRank())
                .imageUrl(word.getImageUrl())
                .audioUrl(word.getAudioUrl())
                .wordBookId(word.getWordBook().getId())
                .wordBookName(word.getWordBook().getName())
                .createdAt(word.getCreatedAt())
                .updatedAt(word.getUpdatedAt())
                .build();
    }
}