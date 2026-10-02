package lk.waypoint.orders.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record Order(
        UUID id,
        String orderRef,
        String outletId,
        String productBrand,
        String itemDescription,
        LocalDate orderDate,
        Instant placedAt,
        boolean afterCutoff,
        TempRequirement tempRequirement,
        int units,
        BigDecimal weightKg,
        BigDecimal volumeM3,
        OrderStatus status) { }
