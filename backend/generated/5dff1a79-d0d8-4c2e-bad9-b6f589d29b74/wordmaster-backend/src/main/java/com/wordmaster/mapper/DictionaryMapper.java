package com.wordmaster.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wordmaster.entity.Dictionary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DictionaryMapper extends BaseMapper<Dictionary> {
    
    /**
     * 查询所有词库
     */
    @Select("SELECT * FROM dictionary WHERE deleted = 0 ORDER BY id")
    List<Dictionary> selectAll();
    
    /**
     * 根据分类查询词库
     */
    @Select("SELECT * FROM dictionary WHERE category = #{category} AND deleted = 0")
    List<Dictionary> selectByCategory(@Param("category") String category);
    
    /**
     * 查询热门词库
     */
    @Select("SELECT * FROM dictionary WHERE deleted = 0 ORDER BY total_words DESC LIMIT #{limit}")
    List<Dictionary> selectPopular(@Param("limit") int limit);
}