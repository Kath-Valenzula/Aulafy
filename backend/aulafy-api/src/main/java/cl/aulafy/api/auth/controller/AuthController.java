package cl.aulafy.api.auth.controller;

import cl.aulafy.api.auth.dto.LoginRequest;
import cl.aulafy.api.auth.dto.LoginResponse;
import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.auth.service.AuthService;
import cl.aulafy.api.users.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return authService.me(userDetails.getUsername());
    }
}
