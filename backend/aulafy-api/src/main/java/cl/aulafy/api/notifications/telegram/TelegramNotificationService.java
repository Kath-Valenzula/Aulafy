package cl.aulafy.api.notifications.telegram;

import cl.aulafy.api.notifications.dto.NotificationLogResponse;
import cl.aulafy.api.notifications.entity.NotificationLog;
import cl.aulafy.api.notifications.entity.NotificationType;
import cl.aulafy.api.notifications.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TelegramNotificationService {

    private static final Logger log = LoggerFactory.getLogger(TelegramNotificationService.class);

    private final String botToken;
    private final String defaultChatId;
    private final RestTemplate restTemplate;
    private final NotificationLogRepository notificationLogRepository;

    public TelegramNotificationService(
            @Value("${telegram.bot-token:}") String botToken,
            @Value("${telegram.chat-id:}") String defaultChatId,
            RestTemplate restTemplate,
            NotificationLogRepository notificationLogRepository
    ) {
        this.botToken = botToken;
        this.defaultChatId = defaultChatId;
        this.restTemplate = restTemplate;
        this.notificationLogRepository = notificationLogRepository;
    }

    @Transactional
    public NotificationLogResponse sendConfiguredChat(String message) {
        return send(defaultChatId, message);
    }

    @Transactional
    public NotificationLogResponse send(String chatId, String message) {
        String targetChatId = normalize(chatId);
        if (!isConfigured(targetChatId)) {
            log.info("Telegram no configurado. Defina TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID para enviar mensajes.");
            return save(targetChatId == null ? "NO_CONFIGURADO" : targetChatId, message, "NO_CONFIGURADO",
                    "Faltan variables de entorno de Telegram");
        }

        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url,
                    Map.of("chat_id", targetChatId, "text", message),
                    String.class
            );
            return save(targetChatId, message, response.getStatusCode().is2xxSuccessful() ? "ENVIADO" : "ERROR",
                    response.getBody());
        } catch (RuntimeException exception) {
            log.warn("No fue posible enviar mensaje por Telegram: {}", exception.getMessage());
            return save(targetChatId, message, "ERROR", exception.getMessage());
        }
    }

    private boolean isConfigured(String chatId) {
        return botToken != null && !botToken.isBlank() && chatId != null && !chatId.isBlank();
    }

    private String normalize(String chatId) {
        if (chatId != null && !chatId.isBlank()) {
            return chatId.trim();
        }
        return defaultChatId == null || defaultChatId.isBlank() ? null : defaultChatId.trim();
    }

    private NotificationLogResponse save(String recipient, String message, String status, String detail) {
        NotificationLog logEntry = new NotificationLog(NotificationType.TELEGRAM, recipient, message, status, detail);
        return NotificationLogResponse.from(notificationLogRepository.save(logEntry));
    }
}
