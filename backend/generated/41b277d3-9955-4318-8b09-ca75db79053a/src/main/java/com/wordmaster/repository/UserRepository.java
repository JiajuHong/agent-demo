package com.wordmaster.repository;

import com.wordmaster.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :lastLoginAt WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("lastLoginAt") LocalDateTime lastLoginAt);
    
    @Modifying
    @Query("UPDATE User u SET u.streakDays = u.streakDays + 1 WHERE u.id = :userId")
    void incrementStreak(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE User u SET u.totalWordsLearned = u.totalWordsLearned + :count WHERE u.id = :userId")
    void incrementTotalWordsLearned(@Param("userId") Long userId, @Param("count") Integer count);
    
    @Modifying
    @Query("UPDATE User u SET u.masteredWords = u.masteredWords + :count WHERE u.id = :userId")
    void incrementMasteredWords(@Param("userId") Long userId, @Param("count") Integer count);
}