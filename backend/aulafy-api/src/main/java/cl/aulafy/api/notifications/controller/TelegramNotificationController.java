package cl.aulafy.api.notifications.controller;

import cl.aulafy.api.notifications.dto.NotificationLogResponse;
import cl.aulafy.api.notifications.dto.TelegramMessageRequest;
import cl.aulafy.api.notifications.telegram.TelegramNotificationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/telegram")
@PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
public class TelegramNotificationController {

    private final TelegramNotificationService telegramNotificationService;

    public TelegramNotificationController(TelegramNotificationService telegramNotificationService) {
        this.telegramNotificationService = telegramNotificationService;
    }

    @PostMapping("/test")
    public NotificationLogResponse test() {
        return telegramNotificationService.sendConfiguredChat("Mensaje de prueba desde Aulafy");
    }

    @PostMapping("/send")
    public NotificationLogResponse send(@Valid @RequestBody TelegramMessageRequest request) {
        return telegramNotificationService.send(request.chatId(), request.message().trim());
    }
}
