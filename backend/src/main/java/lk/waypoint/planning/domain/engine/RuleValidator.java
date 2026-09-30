package lk.waypoint.planning.domain.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class RuleValidator {
    public List<RuleFailure> validate(PlanningOrder order, PlanningVehicle vehicle, TripDraft trip,
            TravelProfile travel, ServiceAllowanceProvider allowances, double weeklyFuelUsed,
            int familyMinutes) {
        List<RuleFailure> failures = new ArrayList<>();
        if (vehicle.status() != VehicleStatus.AVAILABLE) {
            failures.add(new RuleFailure("VEHICLE_UNAVAILABLE", "Vehicle is in workshop"));
        }
        if (!vehicle.depotId().equals(order.depotId())) {
            failures.add(new RuleFailure("HOME_DEPOT", "Vehicle belongs to another depot"));
        }
        if (order.parkingConstraint() == ParkingConstraint.VAN_ONLY && vehicle.type() != VehicleType.VAN) {
            failures.add(new RuleFailure("VAN_ONLY_LIMIT", "Outlet requires a van"));
        }
        if (order.temperature() == TempClass.CHILLED && vehicle.temperature() != VehicleTemperature.REEFER) {
            failures.add(new RuleFailure("NO_REEFER_CAPACITY", "Chilled order requires a reefer"));
        }
        if (trip != null) {
            if (trip.brand() != order.brand()) {
                failures.add(new RuleFailure("BRAND_MIX", "A trip may contain one brand"));
            }
            if (!trip.districtId().equals(order.districtId())) {
                failures.add(new RuleFailure("DISTRICT_MIX", "A trip may contain one district"));
            }
            if (trip.totalWeightKg().add(order.weightKg()).compareTo(vehicle.weightCapKg()) > 0) {
                failures.add(new RuleFailure("WEIGHT_CAPACITY", "Weight capacity exceeded"));
            }
            if (trip.totalVolumeM3().add(order.volumeM3()).compareTo(vehicle.volumeCapM3()) > 0) {
                failures.add(new RuleFailure("VOLUME_CAPACITY", "Volume capacity exceeded"));
            }
        } else if (order.weightKg().compareTo(vehicle.weightCapKg()) > 0
                || order.volumeM3().compareTo(vehicle.volumeCapM3()) > 0) {
            failures.add(new RuleFailure("CAPACITY", "Order exceeds vehicle capacity"));
        }
        List<PlanningOrder> candidateOrders = trip == null ? List.of(order)
                : new ArrayList<>(trip.orders());
        if (trip != null) {
            candidateOrders.add(order);
        }
        int candidateMinutes = TripMetrics.minutes(travel, candidateOrders, allowances);
        int budget = order.brand() == Brand.FRESH ? 270 : 480;
        if (familyMinutes + candidateMinutes > budget) {
            failures.add(new RuleFailure("TIME_BUDGET", "Brand family time budget exceeded"));
        }
        double candidateFuel = TripMetrics.fuelLitres(travel, candidateOrders, vehicle);
        if (weeklyFuelUsed + candidateFuel > vehicle.weeklyFuelQuotaL().doubleValue()) {
            failures.add(new RuleFailure("FUEL_QUOTA", "Weekly fuel quota exceeded"));
        }
        return List.copyOf(failures);
    }

    public record RuleFailure(String code, String message) { }
}
