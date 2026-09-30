package lk.waypoint.planning.domain.engine;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanningOrder(
        UUID id,
        String depotId,
        String districtId,
        Brand brand,
        TempClass temperature,
        ParkingConstraint parkingConstraint,
        DockType dockType,
        BigDecimal weightKg,
        BigDecimal volumeM3,
        boolean chilledPerishable,
        boolean tightWindow,
        boolean festivalRamp,
        boolean lowValueOrDeferrable,
        boolean deferredYesterday,
        int daysSinceLastServed) { }
