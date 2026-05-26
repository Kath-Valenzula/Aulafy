package cl.aulafy.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final String environment;

    public HealthController(@Value("${spring.profiles.active:dev}") String environment) {
        this.environment = environment;
    }

    @GetMapping
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "app", "Aulafy API",
                "environment", environment
        );
    }
}
