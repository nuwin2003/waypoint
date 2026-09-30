package lk.waypoint.planning.domain.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PlanningEngineTest {
    private final ServiceAllowanceProvider allowances = new DefaultServiceAllowances();
    private final TravelProfile gampaha = new TravelProfile(37, 24, 9, 4);
    private final PlanningVehicle reefer = vehicle("R1", VehicleType.TRUCK, VehicleTemperature.REEFER, 1000, 20);

    @Test
    void calculatesWorkedFreshTripAs101Minutes() {
        List<PlanningOrder> orders = List.of(order(Brand.FRESH, DockType.REAR_DOCK),
                order(Brand.FRESH, DockType.REAR_DOCK), order(Brand.FRESH, DockType.STREET));

        assertThat(TripMetrics.minutes(gampaha, orders, allowances)).isEqualTo(101);
    }

    @Test
    void rejectsThirdFreshTripWhenCombinedBudgetIsExceeded() {
        PlanningVehicle vehicle = vehicle("R1", VehicleType.TRUCK, VehicleTemperature.REEFER, 10000, 100);
        List<PlanningOrder> orders = List.of(
                orderWithSize(Brand.FRESH, 100, 1), orderWithSize(Brand.FRESH, 100, 1),
                orderWithSize(Brand.FRESH, 100, 1), orderWithSize(Brand.FRESH, 100, 1),
                orderWithSize(Brand.FRESH, 100, 1), orderWithSize(Brand.FRESH, 100, 1),
                orderWithSize(Brand.FRESH, 100, 1));

        AllocationResult result = new Allocator(new RuleValidator(), new PriorityScorer(), allowances)
                .allocate(orders, List.of(vehicle), Map.of("D1", new TravelProfile(37, 24, 9, 4)), Map.of());

        assertThat(result.trips()).hasSize(2);
        assertThat(result.deferrals()).hasSize(1);
    }

    @Test
    void prioritizesOrderDeferredYesterday() {
        PlanningOrder deferred = order(Brand.FRESH, DockType.STREET, true);
        PlanningOrder newOrder = order(Brand.FRESH, DockType.STREET, false);
        PriorityScorer scorer = new PriorityScorer();

        assertThat(scorer.score(deferred).value()).isGreaterThan(scorer.score(newOrder).value());
    }

    private PlanningOrder order(Brand brand, DockType dock) {
        return new PlanningOrder(UUID.randomUUID(), "D1", "D1", brand, TempClass.AMBIENT,
                ParkingConstraint.STANDARD, dock, BigDecimal.TEN, BigDecimal.ONE, false, false, false, false, false, 0);
    }

    private PlanningOrder order(Brand brand, DockType dock, boolean deferred) {
        PlanningOrder base = order(brand, dock);
        return new PlanningOrder(base.id(), base.depotId(), base.districtId(), base.brand(), base.temperature(),
                base.parkingConstraint(), base.dockType(), base.weightKg(), base.volumeM3(), base.chilledPerishable(),
                base.tightWindow(), base.festivalRamp(), base.lowValueOrDeferrable(), deferred, base.daysSinceLastServed());
    }

    private PlanningOrder orderWithSize(Brand brand, int weight, int volume) {
        PlanningOrder base = order(brand, DockType.REAR_DOCK);
        return new PlanningOrder(base.id(), base.depotId(), base.districtId(), base.brand(), base.temperature(),
                base.parkingConstraint(), base.dockType(), BigDecimal.valueOf(weight), BigDecimal.valueOf(volume),
                base.chilledPerishable(), base.tightWindow(), base.festivalRamp(), base.lowValueOrDeferrable(),
                base.deferredYesterday(), base.daysSinceLastServed());
    }

    private PlanningVehicle vehicle(String id, VehicleType type, VehicleTemperature temperature, int weight, int volume) {
        return new PlanningVehicle(id, "D1", type, temperature, VehicleStatus.AVAILABLE,
                BigDecimal.valueOf(weight), BigDecimal.valueOf(volume), BigDecimal.valueOf(10000), BigDecimal.TEN);
    }
}
