package com.wordmaster.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "注册请求")
public class RegisterRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Schema(description = "用户名", example = "testuser")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码", example = "password123")
    private String password;
    
    @Schema(description = "昵称", example = "测试用户")
    private String nickname;
}