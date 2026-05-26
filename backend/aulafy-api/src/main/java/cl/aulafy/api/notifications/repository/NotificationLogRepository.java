package cl.aulafy.api.notifications.repository;

import cl.aulafy.api.notifications.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
}
