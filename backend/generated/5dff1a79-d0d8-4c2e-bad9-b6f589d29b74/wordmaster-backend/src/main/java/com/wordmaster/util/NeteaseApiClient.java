package com.wordmaster.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wordmaster.dto.response.WordResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Slf4j
@Component
public class NeteaseApiClient {
    
    @Value("${netease.api.base-url}")
    private String baseUrl;
    
    @Value("${netease.api.app-key}")
    private String appKey;
    
    @Value("${netease.api.app-secret}")
    private String appSecret;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public NeteaseApiClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 查询单词详细信息
     */
    public WordResponse queryWord(String word) {
        try {
            // 构建请求URL
            String url = baseUrl + "/jsonapi";
            
            // 构建请求参数
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("q", word)
                    .queryParam("key", appKey)
                    .queryParam("keyfrom", "wordmaster")
                    .queryParam("type", "data")
                    .queryParam("doctype", "json")
                    .queryParam("version", "1.2");
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "WordMaster/1.0");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseWordResponse(response.getBody(), word);
            }
            
        } catch (Exception e) {
            log.error("调用网易有道API失败: {}", e.getMessage(), e);
        }
        
        return createDefaultWordResponse(word);
    }
    
    /**
     * 解析API响应
     */
    private WordResponse parseWordResponse(String responseBody, String word) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            WordResponse wordResponse = new WordResponse();
            wordResponse.setWord(word);
            
            // 解析音标
            if (root.has("basic") && root.get("basic").has("phonetic")) {
                wordResponse.setPhonetic(root.get("basic").get("phonetic").asText());
            }
            
            // 解析释义
            if (root.has("basic") && root.get("basic").has("explains")) {
                JsonNode explains = root.get("basic").get("explains");
                StringBuilder definitionBuilder = new StringBuilder();
                
                for (JsonNode explain : explains) {
                    definitionBuilder.append(explain.asText()).append("; ");
                }
                
                if (definitionBuilder.length() > 0) {
                    wordResponse.setDefinition(definitionBuilder.substring(0, definitionBuilder.length() - 2));
                }
            }
            
            // 解析例句
            if (root.has("web")) {
                JsonNode web = root.get("web");
                StringBuilder exampleBuilder = new StringBuilder();
                
                for (JsonNode webItem : web) {
                    if (webItem.has("value")) {
                        JsonNode values = webItem.get("value");
                        for (JsonNode value : values) {
                            exampleBuilder.append(value.asText()).append("; ");
                        }
                    }
                }
                
                if (exampleBuilder.length() > 0) {
                    wordResponse.setExample(exampleBuilder.substring(0, exampleBuilder.length() - 2));
                }
            }
            
            // 设置默认值
            if (wordResponse.getPhonetic() == null) {
                wordResponse.setPhonetic("");
            }
            
            if (wordResponse.getDefinition() == null) {
                wordResponse.setDefinition("未找到释义");
            }
            
            if (wordResponse.getExample() == null) {
                wordResponse.setExample("未找到例句");
            }
            
            // 根据单词长度设置难度
            wordResponse.setDifficulty(calculateDifficulty(word));
            
            return wordResponse;
            
        } catch (Exception e) {
            log.error("解析网易有道API响应失败: {}", e.getMessage(), e);
            return createDefaultWordResponse(word);
        }
    }
    
    /**
     * 根据单词长度计算难度
     */
    private int calculateDifficulty(String word) {
        int length = word.length();
        
        if (length <= 4) {
            return 1; // 简单
        } else if (length <= 6) {
            return 2; // 较简单
        } else if (length <= 8) {
            return 3; // 中等
        } else if (length <= 10) {
            return 4; // 较难
        } else {
            return 5; // 困难
        }
    }
    
    /**
     * 创建默认的单词响应
     */
    private WordResponse createDefaultWordResponse(String word) {
        WordResponse wordResponse = new WordResponse();
        wordResponse.setWord(word);
        wordResponse.setPhonetic("");
        wordResponse.setDefinition("未找到释义，请检查单词拼写");
        wordResponse.setExample("暂无例句");
        wordResponse.setDifficulty(calculateDifficulty(word));
        return wordResponse;
    }
    
    /**
     * 批量查询单词
     */
    public List<WordResponse> batchQueryWords(List<String> words) {
        List<WordResponse> results = new ArrayList<>();
        
        for (String word : words) {
            try {
                WordResponse wordResponse = queryWord(word);
                results.add(wordResponse);
                
                // 避免请求过快
                Thread.sleep(100);
                
            } catch (Exception e) {
                log.error("查询单词失败: {}", word, e);
                results.add(createDefaultWordResponse(word));
            }
        }
        
        return results;
    }
    
    /**
     * 获取单词发音URL
     */
    public String getPronunciationUrl(String word, String type) {
        // type: uk（英式）或 us（美式）
        String language = "en";
        if ("uk".equalsIgnoreCase(type)) {
            language = "uk";
        } else if ("us".equalsIgnoreCase(type)) {
            language = "us";
        }
        
        return String.format("%s/dictvoice?audio=%s&type=%s", baseUrl, word, language);
    }
    
    /**
     * 测试API连接
     */
    public boolean testConnection() {
        try {
            WordResponse response = queryWord("test");
            return response != null && response.getDefinition() != null;
        } catch (Exception e) {
            log.error("测试网易有道API连接失败: {}", e.getMessage());
            return false;
        }
    }
}