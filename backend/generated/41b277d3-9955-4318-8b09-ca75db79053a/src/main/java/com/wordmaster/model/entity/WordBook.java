package com.wordmaster.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "word_books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(name = "total_words", nullable = false)
    private Integer totalWords = 0;

    @Column(name = "difficulty_level", nullable = false)
    private Integer difficultyLevel = 1;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "is_official", nullable = false)
    private Boolean isOfficial = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "wordBook", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Word> words = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (totalWords == null) totalWords = 0;
        if (difficultyLevel == null) difficultyLevel = 1;
        if (isPublic == null) isPublic = false;
        if (isOfficial == null) isOfficial = false;
    }
}