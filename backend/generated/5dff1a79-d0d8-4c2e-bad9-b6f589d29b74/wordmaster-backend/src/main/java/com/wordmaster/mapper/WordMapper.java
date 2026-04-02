package com.wordmaster.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wordmaster.entity.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WordMapper extends BaseMapper<Word> {
    
    /**
     * 根据单词查询
     */
    @Select("SELECT * FROM word WHERE word = #{word} AND deleted = 0")
    Word selectByWord(@Param("word") String word);
    
    /**
     * 根据词库ID查询单词
     */
    @Select("SELECT * FROM word WHERE dictionary_id = #{dictionaryId} AND deleted = 0")
    List<Word> selectByDictionaryId(@Param("dictionaryId") Long dictionaryId);
    
    /**
     * 搜索单词
     */
    @Select("SELECT * FROM word WHERE word LIKE CONCAT('%', #{keyword}, '%') AND deleted = 0 LIMIT #{limit}")
    List<Word> searchByKeyword(@Param("keyword") String keyword, @Param("limit") int limit);
    
    /**
     * 获取随机单词
     */
    @Select("SELECT * FROM word WHERE deleted = 0 ORDER BY RAND() LIMIT #{count}")
    List<Word> selectRandomWords(@Param("count") int count);
    
    /**
     * 根据难度查询单词
     */
    @Select("SELECT * FROM word WHERE difficulty = #{difficulty} AND deleted = 0 LIMIT #{limit}")
    List<Word> selectByDifficulty(@Param("difficulty") int difficulty, @Param("limit") int limit);
}