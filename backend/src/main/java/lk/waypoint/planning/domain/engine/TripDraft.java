package lk.waypoint.planning.domain.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class TripDraft {
    private final String vehicleId;
    private final int tripNo;
    private final Brand brand;
    private final String districtId;
    private final PlanningVehicle vehicle;
    private final TravelProfile travel;
    private final ServiceAllowanceProvider allowances;
    private final List<PlanningOrder> orders = new ArrayList<>();

    public TripDraft(String vehicleId, int tripNo, Brand brand, String districtId,
            PlanningVehicle vehicle, TravelProfile travel, ServiceAllowanceProvider allowances) {
        this.vehicleId = vehicleId;
        this.tripNo = tripNo;
        this.brand = brand;
        this.districtId = districtId;
        this.vehicle = vehicle;
        this.travel = travel;
        this.allowances = allowances;
    }

    public void add(PlanningOrder order) {
        orders.add(order);
    }

    public String vehicleId() { return vehicleId; }
    public int tripNo() { return tripNo; }
    public Brand brand() { return brand; }
    public String districtId() { return districtId; }
    public PlanningVehicle vehicle() { return vehicle; }
    public List<PlanningOrder> orders() { return List.copyOf(orders); }
    public int minutes() { return TripMetrics.minutes(travel, orders, allowances); }
    public double fuelLitres() { return TripMetrics.fuelLitres(travel, orders, vehicle); }
    public BigDecimal totalWeightKg() { return orders.stream().map(PlanningOrder::weightKg).reduce(BigDecimal.ZERO, BigDecimal::add); }
    public BigDecimal totalVolumeM3() { return orders.stream().map(PlanningOrder::volumeM3).reduce(BigDecimal.ZERO, BigDecimal::add); }
}
