package cl.aulafy.api.auth.service;

import cl.aulafy.api.auth.dto.LoginRequest;
import cl.aulafy.api.auth.dto.LoginResponse;
import cl.aulafy.api.auth.security.JwtService;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsTokenAndUserWhenCredentialsAreValid() {
        User user = new User("Profesor Demo", "profesor@aulafy.cl", "hash", RoleName.PROFESOR, null);
        user.setId(3L);
        when(userRepository.findByEmailIgnoreCase("profesor@aulafy.cl")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("profesor@aulafy.cl", "Profesor1234"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("profesor@aulafy.cl");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginPropagatesInvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("profesor@aulafy.cl", "incorrecta")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
