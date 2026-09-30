package lk.waypoint.planning.domain.engine;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class Allocator {
    private final RuleValidator validator;
    private final PriorityScorer scorer;
    private final ServiceAllowanceProvider allowances;

    public Allocator(RuleValidator validator, PriorityScorer scorer, ServiceAllowanceProvider allowances) {
        this.validator = validator;
        this.scorer = scorer;
        this.allowances = allowances;
    }

    public AllocationResult allocate(List<PlanningOrder> orders, List<PlanningVehicle> vehicles,
            Map<String, TravelProfile> travelByDistrict, Map<String, Double> weeklyFuelUsed) {
        List<PlanningVehicle> availableVehicles = vehicles.stream()
                .filter(vehicle -> vehicle.status() == VehicleStatus.AVAILABLE)
                .toList();
        Map<String, VehicleState> states = new HashMap<>();
        availableVehicles.forEach(vehicle -> states.put(vehicle.id(), new VehicleState(vehicle)));
        List<PlanningOrder> ranked = orders.stream()
                .sorted(Comparator.comparingInt((PlanningOrder order) -> scorer.score(order).value()).reversed()
                        .thenComparing(PlanningOrder::id))
                .toList();
        List<AllocationResult.Deferral> deferrals = new ArrayList<>();
        for (PlanningOrder order : ranked) {
            Assignment assignment = findAssignment(order, states, travelByDistrict, weeklyFuelUsed);
            if (assignment == null) {
                PriorityScorer.Score score = scorer.score(order);
                deferrals.add(new AllocationResult.Deferral(order.id(), "NO_COMPATIBLE_CAPACITY", true,
                        score.value(), score.breakdown()));
            } else {
                assignment.trip().add(order);
                assignment.state().accept(assignment.trip(), order);
            }
        }
        return new AllocationResult(states.values().stream().flatMap(state -> state.trips.stream()).toList(), deferrals);
    }

    private Assignment findAssignment(PlanningOrder order, Map<String, VehicleState> states,
            Map<String, TravelProfile> travelByDistrict, Map<String, Double> weeklyFuelUsed) {
        TravelProfile travel = travelByDistrict.get(order.districtId());
        if (travel == null) {
            return null;
        }
        Assignment best = null;
        for (VehicleState state : states.values()) {
            for (TripDraft trip : state.trips) {
                if (trip.brand() != order.brand() || !trip.districtId().equals(order.districtId())) {
                    continue;
                }
                List<RuleValidator.RuleFailure> failures = validator.validate(order, state.vehicle, trip, travel,
                    allowances, weeklyFuelUsed.getOrDefault(state.vehicle.id(), 0.0) + state.fuelUsed,
                    state.familyMinutes(order.brand()));
                if (failures.isEmpty() && (best == null || trip.orders().size() < best.trip().orders().size())) {
                    best = new Assignment(state, trip);
                }
            }
            if (state.trips.size() < 2) {
                int tripNo = state.trips.size() + 1;
                TripDraft candidate = new TripDraft(state.vehicle.id(), tripNo, order.brand(), order.districtId(),
                        state.vehicle, travel, allowances);
                List<RuleValidator.RuleFailure> failures = validator.validate(order, state.vehicle, candidate, travel,
                    allowances, weeklyFuelUsed.getOrDefault(state.vehicle.id(), 0.0) + state.fuelUsed,
                    state.familyMinutes(order.brand()));
                if (failures.isEmpty() && (best == null || tripNo < best.trip().tripNo())) {
                    best = new Assignment(state, candidate);
                }
            }
        }
        return best;
    }

    private record Assignment(VehicleState state, TripDraft trip) { }

    private static final class VehicleState {
        private final PlanningVehicle vehicle;
        private final List<TripDraft> trips = new ArrayList<>();
        private double fuelUsed;

        private VehicleState(PlanningVehicle vehicle) {
            this.vehicle = vehicle;
        }

        private int familyMinutes(Brand brand) {
            return trips.stream().filter(trip -> (brand == Brand.FRESH) == (trip.brand() == Brand.FRESH))
                    .mapToInt(TripDraft::minutes).sum();
        }

        private void accept(TripDraft trip, PlanningOrder order) {
            if (!trips.contains(trip)) {
                trips.add(trip);
            }
            fuelUsed = trips.stream().mapToDouble(TripDraft::fuelLitres).sum();
        }
    }
}
