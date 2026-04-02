package com.wordmaster.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    
    private final Integer code;
    private final String message;
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
    
    public BusinessException(String message) {
        this(1000, message);
    }
    
    // 用户相关异常
    public static BusinessException userNotFound() {
        return new BusinessException(1001, "用户不存在");
    }
    
    public static BusinessException userAlreadyExists() {
        return new BusinessException(1002, "用户已存在");
    }
    
    public static BusinessException passwordError() {
        return new BusinessException(1003, "密码错误");
    }
    
    public static BusinessException tokenInvalid() {
        return new BusinessException(1004, "令牌无效");
    }
    
    public static BusinessException tokenExpired() {
        return new BusinessException(1005, "令牌已过期");
    }
    
    public static BusinessException unauthorized() {
        return new BusinessException(1006, "未授权访问");
    }
    
    // 单词相关异常
    public static BusinessException wordNotFound() {
        return new BusinessException(2001, "单词不存在");
    }
    
    public static BusinessException wordAlreadyExists() {
        return new BusinessException(2002, "单词已存在");
    }
    
    // 学习相关异常
    public static BusinessException studyRecordNotFound() {
        return new BusinessException(3001, "学习记录不存在");
    }
    
    // 系统异常
    public static BusinessException systemError() {
        return new BusinessException(4001, "系统错误");
    }
    
    public static BusinessException parameterError() {
        return new BusinessException(4002, "参数错误");
    }
    
    public static BusinessException externalApiError() {
        return new BusinessException(4003, "外部API调用失败");
    }
}