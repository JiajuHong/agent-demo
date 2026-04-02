package com.wordmaster.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wordmaster.entity.StudyRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface StudyRecordMapper extends BaseMapper<StudyRecord> {
    
    /**
     * 根据用户ID和单词ID查询学习记录
     */
    @Select("SELECT * FROM study_record WHERE user_id = #{userId} AND word_id = #{wordId} AND deleted = 0")
    StudyRecord selectByUserAndWord(@Param("userId") Long userId, @Param("wordId") Long wordId);
    
    /**
     * 查询用户需要复习的单词
     */
    @Select("SELECT sr.* FROM study_record sr " +
            "WHERE sr.user_id = #{userId} AND sr.deleted = 0 " +
            "AND (sr.next_review_time IS NULL OR sr.next_review_time <= #{now}) " +
            "ORDER BY sr.next_review_time ASC, sr.mastery_level ASC " +
            "LIMIT #{limit}")
    List<StudyRecord> selectReviewList(@Param("userId") Long userId, 
                                      @Param("now") LocalDateTime now,
                                      @Param("limit") int limit);
    
    /**
     * 查询用户的学习记录
     */
    @Select("SELECT sr.* FROM study_record sr " +
            "WHERE sr.user_id = #{userId} AND sr.deleted = 0 " +
            "ORDER BY sr.last_review_time DESC " +
            "LIMIT #{limit} OFFSET #{offset}")
    List<StudyRecord> selectByUserId(@Param("userId") Long userId, 
                                    @Param("offset") int offset, 
                                    @Param("limit") int limit);
    
    /**
     * 统计用户学习单词数
     */
    @Select("SELECT COUNT(DISTINCT word_id) FROM study_record WHERE user_id = #{userId} AND deleted = 0")
    int countLearnedWords(@Param("userId") Long userId);
    
    /**
     * 统计用户今日学习单词数
     */
    @Select("SELECT COUNT(*) FROM study_record " +
            "WHERE user_id = #{userId} AND DATE(last_review_time) = CURDATE() AND deleted = 0")
    int countTodayLearnedWords(@Param("userId") Long userId);
    
    /**
     * 统计用户今日复习单词数
     */
    @Select("SELECT COUNT(*) FROM study_record " +
            "WHERE user_id = #{userId} AND DATE(last_review_time) = CURDATE() " +
            "AND review_count > 0 AND deleted = 0")
    int countTodayReviewedWords(@Param("userId") Long userId);
    
    /**
     * 查询用户词库学习进度
     */
    @Select("SELECT COUNT(DISTINCT sr.word_id) as learned_count " +
            "FROM study_record sr " +
            "JOIN word w ON sr.word_id = w.id AND w.deleted = 0 " +
            "WHERE sr.user_id = #{userId} AND sr.deleted = 0 " +
            "AND w.dictionary_id = #{dictionaryId}")
    int countLearnedWordsByDictionary(@Param("userId") Long userId, 
                                     @Param("dictionaryId") Long dictionaryId);
}