package com.wordmaster.repository;

import com.wordmaster.model.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByWord(String word);
    List<Word> findByWordBookId(Long wordBookId);
    Page<Word> findByWordBookId(Long wordBookId, Pageable pageable);
    
    @Query("SELECT w FROM Word w WHERE w.wordBook.id = :bookId AND w.isActive = true ORDER BY w.difficulty ASC")
    List<Word> findActiveWordsByBookId(@Param("bookId") Long bookId);
    
    @Query("SELECT w FROM Word w WHERE w.wordBook.id = :bookId AND w.difficulty BETWEEN :minDifficulty AND :maxDifficulty")
    List<Word> findByBookIdAndDifficultyRange(@Param("bookId") Long bookId, 
                                              @Param("minDifficulty") Integer minDifficulty, 
                                              @Param("maxDifficulty") Integer maxDifficulty);
    
    @Query("SELECT COUNT(w) FROM Word w WHERE w.wordBook.id = :bookId AND w.isActive = true")
    Long countActiveWordsByBookId(@Param("bookId") Long bookId);
    
    @Query(value = "SELECT * FROM words WHERE word_book_id = :bookId AND is_active = true ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Word> findRandomWordsByBookId(@Param("bookId") Long bookId, @Param("limit") Integer limit);
}