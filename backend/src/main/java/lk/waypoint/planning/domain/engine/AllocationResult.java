package lk.waypoint.planning.domain.engine;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AllocationResult(List<TripDraft> trips, List<Deferral> deferrals) {
    public AllocationResult {
        trips = List.copyOf(trips);
        deferrals = List.copyOf(deferrals);
    }

    public record Deferral(UUID orderId, String reasonCode, boolean unavoidable, int priorityScore,
            Map<String, Integer> scoreBreakdown) { }
}
