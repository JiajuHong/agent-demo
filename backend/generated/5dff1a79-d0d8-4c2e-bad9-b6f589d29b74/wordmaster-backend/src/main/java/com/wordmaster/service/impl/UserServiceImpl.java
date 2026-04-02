package com.wordmaster.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wordmaster.dto.request.LoginRequest;
import com.wordmaster.dto.request.RegisterRequest;
import com.wordmaster.dto.response.UserResponse;
import com.wordmaster.entity.User;
import com.wordmaster.exception.BusinessException;
import com.wordmaster.mapper.UserMapper;
import com.wordmaster.service.UserService;
import com.wordmaster.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userMapper.countByUsername(request.getUsername()) > 0) {
            throw BusinessException.userAlreadyExists();
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(encodePassword(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setAvatar(""); // 默认头像
        user.setCreatedTime(LocalDateTime.now());
        
        // 保存用户
        int result = userMapper.insert(user);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("用户注册成功: username={}, id={}", user.getUsername(), user.getId());
        
        // 生成token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        // 返回用户信息
        return convertToResponse(user, token);
    }
    
    @Override
    public UserResponse login(LoginRequest request) {
        // 查询用户
        User user = getUserByUsername(request.getUsername());
        if (user == null) {
            throw BusinessException.userNotFound();
        }
        
        // 验证密码
        if (!verifyPassword(request.getPassword(), user.getPassword())) {
            throw BusinessException.passwordError();
        }
        
        log.info("用户登录成功: username={}, id={}", user.getUsername(), user.getId());
        
        // 生成token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        // 返回用户信息
        return convertToResponse(user, token);
    }
    
    @Override
    public UserResponse getUserInfo(Long userId) {
        User user = getUserById(userId);
        if (user == null) {
            throw BusinessException.userNotFound();
        }
        
        return convertToResponse(user, null);
    }
    
    @Override
    @Transactional
    public UserResponse updateUserInfo(Long userId, User updateUser) {
        User user = getUserById(userId);
        if (user == null) {
            throw BusinessException.userNotFound();
        }
        
        // 更新用户信息
        if (updateUser.getNickname() != null) {
            user.setNickname(updateUser.getNickname());
        }
        
        if (updateUser.getAvatar() != null) {
            user.setAvatar(updateUser.getAvatar());
        }
        
        // 保存更新
        int result = userMapper.updateById(user);
        if (result <= 0) {
            throw BusinessException.systemError();
        }
        
        log.info("用户信息更新成功: userId={}", userId);
        
        return convertToResponse(user, null);
    }
    
    @Override
    public User getUserByUsername(String username) {
        return userMapper.selectByUsername(username);
    }
    
    @Override
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }
    
    @Override
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    @Override
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    /**
     * 将User实体转换为UserResponse
     */
    private UserResponse convertToResponse(User user, String token) {
        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(user, response);
        response.setToken(token);
        return response;
    }
}