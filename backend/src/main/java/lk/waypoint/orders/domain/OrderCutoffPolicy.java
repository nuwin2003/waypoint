package lk.waypoint.orders.domain;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

public final class OrderCutoffPolicy {
    private static final LocalTime CUTOFF = LocalTime.of(16, 0);
    private static final ZoneId COLOMBO = ZoneId.of("Asia/Colombo");

    private OrderCutoffPolicy() { }

    public static Decision decide(LocalDate requestedDate, Clock clock) {
        LocalDateTime now = LocalDateTime.now(clock.withZone(COLOMBO));
        boolean afterCutoff = !now.toLocalTime().isBefore(CUTOFF);
        boolean nextDayOrder = requestedDate.equals(now.toLocalDate().plusDays(1));
        return new Decision(afterCutoff && nextDayOrder, afterCutoff && nextDayOrder
                ? requestedDate.plusDays(1) : requestedDate);
    }

    public record Decision(boolean afterCutoff, LocalDate effectiveDate) { }
}
