package lk.waypoint.masterdata.domain;

import java.math.BigDecimal;

public record VehicleSummary(String id, String depotId, String type, String temperature,
        String status, BigDecimal weightCapKg, BigDecimal volumeCapM3) { }
