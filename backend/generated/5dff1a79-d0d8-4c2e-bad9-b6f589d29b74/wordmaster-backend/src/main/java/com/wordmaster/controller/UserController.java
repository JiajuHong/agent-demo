package com.wordmaster.controller;

import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.UserResponse;
import com.wordmaster.entity.User;
import com.wordmaster.service.UserService;
import com.wordmaster.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户信息管理相关接口")
public class UserController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    public ApiResponse<UserResponse> getCurrentUser(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        UserResponse userResponse = userService.getUserInfo(userId);
        return ApiResponse.success(userResponse);
    }
    
    @PutMapping("/me")
    @Operation(summary = "更新用户信息", description = "更新当前登录用户的个人信息")
    public ApiResponse<UserResponse> updateCurrentUser(
            @RequestBody User updateUser,
            HttpServletRequest request) {
        String token = jwtUtil.getTokenFromHeader(request.getHeader("Authorization"));
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        UserResponse userResponse = userService.updateUserInfo(userId, updateUser);
        return ApiResponse.success("更新成功", userResponse);
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "获取用户信息", description = "根据用户ID获取用户信息")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse userResponse = userService.getUserInfo(userId);
        return ApiResponse.success(userResponse);
    }
}