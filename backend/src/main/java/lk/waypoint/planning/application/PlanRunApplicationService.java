package lk.waypoint.planning.application;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lk.waypoint.planning.domain.PlanningRepository.PlanningOrderSummary;
import lk.waypoint.planning.domain.engine.TripDraft;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lk.waypoint.planning.domain.PlanningRepository;
import lk.waypoint.planning.domain.PlanningRepository.ExistingPlan;
import lk.waypoint.planning.domain.engine.AllocationResult;
import lk.waypoint.planning.domain.engine.Allocator;
import lk.waypoint.planning.domain.engine.TravelProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlanRunApplicationService {
    private final PlanningRepository repository;
    private final Allocator allocator;

    public PlanRunApplicationService(PlanningRepository repository, Allocator allocator) {
        this.repository = repository;
        this.allocator = allocator;
    }

    @Transactional
    public PlanRunResult run(String depotId, LocalDate planDate, UUID assignedOrderId,
            String assignedVehicleId, String actorEmail) {
        if (!repository.canUserAccessDepot(actorEmail, depotId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this depot");
        }
        if ((assignedOrderId == null) != (assignedVehicleId == null)
                || (assignedVehicleId != null && assignedVehicleId.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An assigned order and vehicle must be provided together");
        }
        ExistingPlan existingPlan = repository.findExistingPlan(depotId, planDate).orElse(null);
        if (existingPlan != null) {
            if (assignedOrderId != null && existingPlan.trips().stream().noneMatch(trip ->
                    trip.vehicleId().equals(assignedVehicleId) && trip.orderIds().contains(assignedOrderId))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "A plan already exists for this date; the selected order and vehicle were not changed");
            }
            return new PlanRunResult(existingPlan.id(), depotId, planDate, existingPlan.trips().size(),
                    existingPlan.deferralCount(), List.of(),
                    existingPlan.trips().stream()
                            .map(trip -> new TripResult(trip.vehicleId(), trip.tripNo(), trip.orderIds()))
                            .toList());
        }
        List<lk.waypoint.planning.domain.engine.PlanningOrder> orders =
                repository.findEligibleOrders(depotId, planDate);
        var vehicles = repository.findVehicles(depotId);
        if (assignedOrderId != null && orders.stream().noneMatch(order -> order.id().equals(assignedOrderId))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The selected order is no longer eligible for this plan");
        }
        if (assignedVehicleId != null && vehicles.stream().noneMatch(vehicle ->
                vehicle.id().equals(assignedVehicleId)
                        && vehicle.status() == lk.waypoint.planning.domain.engine.VehicleStatus.AVAILABLE)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The selected vehicle is not available at this depot");
        }
        Map<String, TravelProfile> travel = repository.findTravelProfiles(depotId);
        Map<UUID, String> preferredVehicleByOrder = assignedOrderId == null
                ? Map.of() : Map.of(assignedOrderId, assignedVehicleId);
        AllocationResult allocation = allocator.allocate(orders, vehicles, travel, Map.of(), preferredVehicleByOrder);

        UUID planId = UUID.randomUUID();
        repository.saveDraftPlan(planId, depotId, planDate, actorEmail);
        repository.saveTrips(planId, allocation.trips());
        repository.saveDeferrals(planId, allocation.deferrals());
        List<TripResult> trips = allocation.trips().stream()
                .map(trip -> new TripResult(trip.vehicleId(), trip.tripNo(),
                        trip.orders().stream().map(order -> order.id()).toList()))
                .toList();
        return new PlanRunResult(planId, depotId, planDate, allocation.trips().size(), allocation.deferrals().size(),
                allocation.deferrals(), trips);
    }

    @Transactional(readOnly = true)
    public PlanningContext context(String depotId, LocalDate planDate, String actorEmail) {
        if (!repository.canUserAccessDepot(actorEmail, depotId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this depot");
        }
        ExistingPlan plan = repository.findExistingPlan(depotId, planDate).orElse(null);
        return new PlanningContext(repository.findPlanningOrders(depotId, planDate),
                repository.findPlanningVehicles(depotId), plan == null ? null : plan.id(),
                plan == null ? null : plan.status());
    }

    @Transactional
    public void publish(String depotId, LocalDate planDate, String actorEmail) {
        if (!repository.canUserAccessDepot(actorEmail, depotId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this depot");
        }
        ExistingPlan plan = repository.findExistingPlan(depotId, planDate).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "No dispatch plan exists for this date"));
        if (plan.status().equals("PUBLISHED")) return;
        if (plan.trips().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Create at least one trip before releasing the plan");
        }
        repository.publishPlan(plan.id());
    }

    public record PlanningContext(List<PlanningOrderSummary> orders,
            List<lk.waypoint.planning.domain.engine.PlanningVehicle> vehicles, UUID planId, String planStatus) { }

    public record TripResult(String vehicleId, int tripNo, List<UUID> orderIds) { }

    public record PlanRunResult(UUID planId, String depotId, LocalDate planDate, int tripCount, int deferralCount,
            List<AllocationResult.Deferral> deferrals, List<TripResult> trips) {
        public PlanRunResult {
            deferrals = List.copyOf(deferrals);
            trips = List.copyOf(trips);
        }
    }
}
