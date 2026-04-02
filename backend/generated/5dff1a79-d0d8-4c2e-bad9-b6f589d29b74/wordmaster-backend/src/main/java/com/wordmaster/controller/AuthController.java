package com.wordmaster.controller;

import com.wordmaster.dto.request.LoginRequest;
import com.wordmaster.dto.request.RegisterRequest;
import com.wordmaster.dto.response.ApiResponse;
import com.wordmaster.dto.response.UserResponse;
import com.wordmaster.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "用户注册、登录等认证相关接口")
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "新用户注册接口")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = userService.register(request);
        return ApiResponse.success("注册成功", userResponse);
    }
    
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录接口")
    public ApiResponse<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse userResponse = userService.login(request);
        return ApiResponse.success("登录成功", userResponse);
    }
    
    @GetMapping("/test")
    @Operation(summary = "测试接口", description = "用于测试服务是否正常")
    public ApiResponse<String> test() {
        return ApiResponse.success("服务正常运行");
    }
}