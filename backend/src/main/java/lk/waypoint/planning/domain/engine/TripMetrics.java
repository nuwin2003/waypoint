package lk.waypoint.planning.domain.engine;

import java.util.List;

public final class TripMetrics {
    private TripMetrics() { }

    public static int minutes(TravelProfile travel, List<PlanningOrder> orders,
            ServiceAllowanceProvider allowances) {
        if (orders.isEmpty()) {
            return 0;
        }
        int serviceMinutes = orders.stream()
                .mapToInt(order -> allowances.minutes(order.brand(), order.dockType()))
                .sum();
        return travel.depotToDistrictMinutes() + travel.interStopMinutes() * (orders.size() - 1) + serviceMinutes;
    }

    public static double fuelLitres(TravelProfile travel, List<PlanningOrder> orders,
            PlanningVehicle vehicle) {
        if (orders.isEmpty()) {
            return 0;
        }
        double kilometres = travel.depotToDistrictKm() + travel.interStopKm() * (orders.size() - 1)
                + travel.depotToDistrictKm();
        return kilometres / vehicle.kmPerL().doubleValue();
    }
}
