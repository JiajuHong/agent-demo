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
@Table(name = "words", 
       indexes = {
           @Index(name = "idx_word", columnList = "word"),
           @Index(name = "idx_difficulty", columnList = "difficulty"),
           @Index(name = "idx_word_book", columnList = "word_book_id")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String word;

    @Column(name = "phonetic_symbol", length = 100)
    private String phoneticSymbol;

    @Column(nullable = false, length = 500)
    private String definition;

    @Column(length = 1000)
    private String example;

    @Column(length = 100)
    private String partOfSpeech;

    @Column(nullable = false)
    private Integer difficulty = 1;

    @Column(name = "frequency_rank")
    private Integer frequencyRank;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_book_id", nullable = false)
    private WordBook wordBook;

    @OneToMany(mappedBy = "word", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<LearningRecord> learningRecords = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (difficulty == null) difficulty = 1;
        if (isActive == null) isActive = true;
    }
}