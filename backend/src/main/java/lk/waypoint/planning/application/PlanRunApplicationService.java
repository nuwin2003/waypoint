package lk.waypoint.planning.application;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
        return new PlanRunResult(planId, depotId, planDate, allocation.trips().size(), allocation.deferrals().size(),
                allocation.deferrals());
    }

    public record PlanRunResult(UUID planId, String depotId, LocalDate planDate, int tripCount, int deferralCount,
            List<AllocationResult.Deferral> deferrals) {
        public PlanRunResult {
            deferrals = List.copyOf(deferrals);
        }
    }
}
