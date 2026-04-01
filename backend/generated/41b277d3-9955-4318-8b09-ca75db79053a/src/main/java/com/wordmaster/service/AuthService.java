package com.wordmaster.service;

import com.wordmaster.model.dto.AuthRequest;
import com.wordmaster.model.dto.AuthResponse;
import com.wordmaster.model.dto.RegisterRequest;
import com.wordmaster.model.dto.UserDTO;
import com.wordmaster.model.entity.User;
import com.wordmaster.repository.UserRepository;
import com.wordmaster.security.JwtUtils;
import com.wordmaster.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse authenticate(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                authRequest.getUsername(),
                authRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authRequest.getUsername());
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 更新最后登录时间
        userRepository.updateLastLogin(userDetails.getId(), LocalDateTime.now());
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtils.getJwtExpiration())
                .user(convertToDTO(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        // 创建新用户
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phone(registerRequest.getPhone())
                .dailyGoal(20)
                .streakDays(0)
                .totalWordsLearned(0)
                .masteredWords(0)
                .currentLevel(1)
                .experiencePoints(0)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // 生成token
        String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtils.getJwtExpiration())
                .user(convertToDTO(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateJwtToken(refreshToken)) {
            throw new RuntimeException("刷新令牌无效");
        }

        String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        String newJwt = jwtUtils.generateTokenFromUsername(username);
        String newRefreshToken = jwtUtils.generateRefreshToken(username);

        return AuthResponse.builder()
                .accessToken(newJwt)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtUtils.getJwtExpiration())
                .user(convertToDTO(user))
                .build();
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .dailyGoal(user.getDailyGoal())
                .streakDays(user.getStreakDays())
                .totalWordsLearned(user.getTotalWordsLearned())
                .masteredWords(user.getMasteredWords())
                .currentLevel(user.getCurrentLevel())
                .experiencePoints(user.getExperiencePoints())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}