package com.wordmaster;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.wordmaster.mapper")
@EnableCaching
@EnableScheduling
public class WordMasterApplication {
    public static void main(String[] args) {
        SpringApplication.run(WordMasterApplication.class, args);
    }
}