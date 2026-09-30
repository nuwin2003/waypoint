package lk.waypoint.orders.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class OrderCutoffPolicyTest {
    private static final ZoneId COLOMBO = ZoneId.of("Asia/Colombo");
    private static final LocalDate TODAY = LocalDate.of(2026, 9, 29);

    @Test
    void acceptsNextDayOrderBeforeFourPm() {
        Clock clock = Clock.fixed(Instant.parse("2026-09-29T10:29:00Z"), COLOMBO);

        OrderCutoffPolicy.Decision decision = OrderCutoffPolicy.decide(TODAY.plusDays(1), clock);

        assertThat(decision.afterCutoff()).isFalse();
        assertThat(decision.effectiveDate()).isEqualTo(TODAY.plusDays(1));
    }

    @Test
    void movesNextDayOrderToFollowingRunAtFourPm() {
        Clock clock = Clock.fixed(Instant.parse("2026-09-29T10:30:00Z"), COLOMBO);

        OrderCutoffPolicy.Decision decision = OrderCutoffPolicy.decide(TODAY.plusDays(1), clock);

        assertThat(decision.afterCutoff()).isTrue();
        assertThat(decision.effectiveDate()).isEqualTo(TODAY.plusDays(2));
    }
}
