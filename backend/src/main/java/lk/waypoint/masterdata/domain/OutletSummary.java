package lk.waypoint.masterdata.domain;

public record OutletSummary(String id, String name, String brand, String districtId, String depotId,
        String parkingConstraint, String dockType) { }
