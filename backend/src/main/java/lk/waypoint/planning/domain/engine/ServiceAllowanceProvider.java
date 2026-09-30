package lk.waypoint.planning.domain.engine;

@FunctionalInterface
public interface ServiceAllowanceProvider {
    int minutes(Brand brand, DockType dockType);
}
