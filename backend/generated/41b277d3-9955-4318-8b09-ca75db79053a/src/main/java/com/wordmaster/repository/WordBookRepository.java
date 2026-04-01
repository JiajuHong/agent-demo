package com.wordmaster.repository;

import com.wordmaster.model.entity.WordBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordBookRepository extends JpaRepository<WordBook, Long> {
    List<WordBook> findByIsPublicTrue();
    Page<WordBook> findByIsPublicTrue(Pageable pageable);
    List<WordBook> findByLanguage(String language);
    List<WordBook> findByDifficultyLevel(Integer difficultyLevel);
    
    @Query("SELECT wb FROM WordBook wb WHERE wb.isPublic = true OR wb.isOfficial = true")
    List<WordBook> findAvailableBooks();
    
    @Modifying
    @Query("UPDATE WordBook wb SET wb.totalWords = (SELECT COUNT(w) FROM Word w WHERE w.wordBook.id = wb.id AND w.isActive = true) WHERE wb.id = :bookId")
    void updateTotalWords(@Param("bookId") Long bookId);
}