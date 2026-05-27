package cl.aulafy.api.notifications.telegram;

import cl.aulafy.api.notifications.dto.NotificationLogResponse;
import cl.aulafy.api.notifications.entity.NotificationLog;
import cl.aulafy.api.notifications.repository.NotificationLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class TelegramNotificationServiceTest {

    @Test
    void sendDoesNotBreakWhenTelegramIsNotConfigured() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        NotificationLogRepository repository = mock(NotificationLogRepository.class);
        TelegramNotificationService service = new TelegramNotificationService("", "", restTemplate, repository);

        when(repository.save(any(NotificationLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationLogResponse response = service.sendConfiguredChat("Mensaje de prueba");

        assertThat(response.status()).isEqualTo("NO_CONFIGURADO");
        assertThat(response.detail()).contains("Faltan variables");
        verifyNoInteractions(restTemplate);
    }
}
