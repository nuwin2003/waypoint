package lk.waypoint.planning.domain.engine;

import java.util.Map;

public final class DefaultServiceAllowances implements ServiceAllowanceProvider {
    private final Map<String, Integer> minutes = Map.of(
            "FRESH:REAR_DOCK", 15, "FRESH:STREET", 16, "FRESH:MALL", 16,
            "STYLE:REAR_DOCK", 20, "STYLE:STREET", 25, "STYLE:MALL", 35,
            "TECH:REAR_DOCK", 30, "TECH:STREET", 35, "TECH:MALL", 40);

    @Override
    public int minutes(Brand brand, DockType dockType) {
        return minutes.get(brand.name() + ":" + dockType.name());
    }
}
