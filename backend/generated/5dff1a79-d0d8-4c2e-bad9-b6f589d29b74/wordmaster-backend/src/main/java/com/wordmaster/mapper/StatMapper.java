package com.wordmaster.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.wordmaster.entity.StatRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface StatMapper extends BaseMapper<StatRecord> {
    
    /**
     * 根据用户ID和日期查询统计记录
     */
    @Select("SELECT * FROM stat_record WHERE user_id = #{userId} AND stat_date = #{statDate} AND deleted = 0")
    StatRecord selectByUserAndDate(@Param("userId") Long userId, @Param("statDate") LocalDate statDate);
    
    /**
     * 查询用户统计记录
     */
    @Select("SELECT * FROM stat_record WHERE user_id = #{userId} AND deleted = 0 " +
            "ORDER BY stat_date DESC LIMIT #{limit}")
    List<StatRecord> selectByUserId(@Param("userId") Long userId, @Param("limit") int limit);
    
    /**
     * 查询用户最近N天的统计记录
     */
    @Select("SELECT * FROM stat_record WHERE user_id = #{userId} AND deleted = 0 " +
            "AND stat_date >= #{startDate} AND stat_date <= #{endDate} " +
            "ORDER BY stat_date")
    List<StatRecord> selectByDateRange(@Param("userId") Long userId, 
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);
    
    /**
     * 统计用户总学习时间
     */
    @Select("SELECT COALESCE(SUM(total_time), 0) FROM stat_record WHERE user_id = #{userId} AND deleted = 0")
    int sumTotalTime(@Param("userId") Long userId);
    
    /**
     * 统计用户总学习单词数
     */
    @Select("SELECT COALESCE(SUM(learned_count), 0) FROM stat_record WHERE user_id = #{userId} AND deleted = 0")
    int sumLearnedCount(@Param("userId") Long userId);
    
    /**
     * 统计用户总复习单词数
     */
    @Select("SELECT COALESCE(SUM(reviewed_count), 0) FROM stat_record WHERE user_id = #{userId} AND deleted = 0")
    int sumReviewedCount(@Param("userId") Long userId);
    
    /**
     * 查询用户学习趋势数据
     */
    @Select("SELECT stat_date, learned_count, reviewed_count, total_time " +
            "FROM stat_record WHERE user_id = #{userId} AND deleted = 0 " +
            "AND stat_date >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "ORDER BY stat_date")
    List<StatRecord> selectTrendData(@Param("userId") Long userId, @Param("days") int days);
}