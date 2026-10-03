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
    public PlanRunResult run(String depotId, LocalDate planDate, String actorEmail) {
        if (!repository.canUserAccessDepot(actorEmail, depotId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this depot");
        }
        List<lk.waypoint.planning.domain.engine.PlanningOrder> orders =
                repository.findEligibleOrders(depotId, planDate);
        var vehicles = repository.findVehicles(depotId);
        Map<String, TravelProfile> travel = repository.findTravelProfiles(depotId);
        AllocationResult allocation = allocator.allocate(orders, vehicles, travel, Map.of());

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
        return new PlanningContext(repository.findPlanningOrders(depotId, planDate),
                repository.findPlanningVehicles(depotId));
    }

    public record PlanningContext(List<PlanningOrderSummary> orders,
            List<lk.waypoint.planning.domain.engine.PlanningVehicle> vehicles) { }

    public record TripResult(String vehicleId, int tripNo, List<UUID> orderIds) { }

    public record PlanRunResult(UUID planId, String depotId, LocalDate planDate, int tripCount, int deferralCount,
            List<AllocationResult.Deferral> deferrals, List<TripResult> trips) {
        public PlanRunResult {
            deferrals = List.copyOf(deferrals);
            trips = List.copyOf(trips);
        }
    }
}
