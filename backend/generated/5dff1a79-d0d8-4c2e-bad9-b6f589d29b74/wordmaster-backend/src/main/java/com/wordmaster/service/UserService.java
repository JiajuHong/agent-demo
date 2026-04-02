package com.wordmaster.service;

import com.wordmaster.dto.request.LoginRequest;
import com.wordmaster.dto.request.RegisterRequest;
import com.wordmaster.dto.response.UserResponse;
import com.wordmaster.entity.User;

public interface UserService {
    
    /**
     * 用户注册
     */
    UserResponse register(RegisterRequest request);
    
    /**
     * 用户登录
     */
    UserResponse login(LoginRequest request);
    
    /**
     * 获取用户信息
     */
    UserResponse getUserInfo(Long userId);
    
    /**
     * 更新用户信息
     */
    UserResponse updateUserInfo(Long userId, User user);
    
    /**
     * 根据用户名查询用户
     */
    User getUserByUsername(String username);
    
    /**
     * 根据用户ID查询用户
     */
    User getUserById(Long userId);
    
    /**
     * 验证用户密码
     */
    boolean verifyPassword(String rawPassword, String encodedPassword);
    
    /**
     * 加密密码
     */
    String encodePassword(String rawPassword);
}