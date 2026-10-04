package lk.waypoint.planning.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lk.waypoint.planning.domain.engine.AllocationResult;
import lk.waypoint.planning.domain.engine.PlanningOrder;
import lk.waypoint.planning.domain.engine.PlanningVehicle;
import lk.waypoint.planning.domain.engine.TravelProfile;
import lk.waypoint.planning.domain.engine.TripDraft;

public interface PlanningRepository {
    List<PlanningOrderSummary> findPlanningOrders(String depotId, LocalDate planDate);
    List<PlanningVehicle> findPlanningVehicles(String depotId);
    List<PlanningOrder> findEligibleOrders(String depotId, LocalDate planDate);
    List<PlanningVehicle> findVehicles(String depotId);
    Map<String, TravelProfile> findTravelProfiles(String depotId);
    boolean canUserAccessDepot(String email, String depotId);
    void saveDraftPlan(UUID planId, String depotId, LocalDate planDate, String createdByEmail);
    void saveTrips(UUID planId, List<TripDraft> trips);
    void saveDeferrals(UUID planId, List<AllocationResult.Deferral> deferrals);
    Optional<ExistingPlan> findExistingPlan(String depotId, LocalDate planDate);

    record PlanningOrderSummary(UUID id, String orderRef, String outletName, String brand,
            String depotId, String temperature, java.math.BigDecimal weightKg,
            java.math.BigDecimal volumeM3, int units, boolean deferredYesterday, String status) { }
    record ExistingPlan(UUID id, int deferralCount, List<ExistingTrip> trips) { }
    record ExistingTrip(String vehicleId, int tripNo, List<UUID> orderIds) { }
}
