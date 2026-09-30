package lk.waypoint.planning.domain.engine;

import java.math.BigDecimal;

public record PlanningVehicle(
        String id,
        String depotId,
        VehicleType type,
        VehicleTemperature temperature,
        VehicleStatus status,
        BigDecimal weightCapKg,
        BigDecimal volumeCapM3,
        BigDecimal weeklyFuelQuotaL,
        BigDecimal kmPerL) { }
