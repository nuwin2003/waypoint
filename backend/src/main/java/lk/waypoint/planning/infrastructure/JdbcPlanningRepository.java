package lk.waypoint.planning.infrastructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lk.waypoint.planning.domain.PlanningRepository;
import lk.waypoint.planning.domain.engine.AllocationResult;
import lk.waypoint.planning.domain.engine.Brand;
import lk.waypoint.planning.domain.engine.DockType;
import lk.waypoint.planning.domain.engine.ParkingConstraint;
import lk.waypoint.planning.domain.engine.PlanningOrder;
import lk.waypoint.planning.domain.engine.PlanningVehicle;
import lk.waypoint.planning.domain.engine.TempClass;
import lk.waypoint.planning.domain.engine.TravelProfile;
import lk.waypoint.planning.domain.engine.TripDraft;
import lk.waypoint.planning.domain.engine.VehicleStatus;
import lk.waypoint.planning.domain.engine.VehicleTemperature;
import lk.waypoint.planning.domain.engine.VehicleType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPlanningRepository implements PlanningRepository {
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public JdbcPlanningRepository(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Override
    public List<PlanningOrderSummary> findPlanningOrders(String depotId, LocalDate planDate) {
        return jdbc.query("""
                SELECT o.id, o.order_ref, x.name AS outlet_name, o.product_brand,
                       x.depot_id, o.temp_requirement, o.order_weight_kg,
                       o.order_volume_m3, o.deferred_yesterday, o.status
                FROM orders o JOIN outlet x ON x.id = o.outlet_id
                WHERE x.depot_id = ? AND o.order_date = ?
                  AND o.status IN ('PLACED', 'NEXT_RUN', 'DEFERRED')
                ORDER BY o.deferred_yesterday DESC, o.placed_at
                """, (row, number) -> new PlanningOrderSummary(
                row.getObject("id", UUID.class), row.getString("order_ref"),
                row.getString("outlet_name"), row.getString("product_brand"),
                row.getString("depot_id"), row.getString("temp_requirement"),
                row.getBigDecimal("order_weight_kg"), row.getBigDecimal("order_volume_m3"),
                row.getBoolean("deferred_yesterday"), row.getString("status")), depotId, planDate);
    }

    @Override
    public List<PlanningVehicle> findPlanningVehicles(String depotId) {
        return findVehicles(depotId);
    }

    @Override
    public List<PlanningOrder> findEligibleOrders(String depotId, LocalDate planDate) {
        return jdbc.query("""
                SELECT o.id, o.outlet_id, o.temp_requirement, o.order_weight_kg, o.order_volume_m3,
                  o.deferred_yesterday, o.days_since_last_served, x.brand, x.district_id,
                  x.parking_constraint, x.dock_type
                FROM orders o JOIN outlet x ON x.id = o.outlet_id
                WHERE x.depot_id = ? AND o.order_date = ?
                  AND o.status IN ('PLACED', 'NEXT_RUN', 'DEFERRED')
                ORDER BY o.placed_at
                """, (row, number) -> mapOrder(row), depotId, planDate);
    }

    @Override
    public List<PlanningVehicle> findVehicles(String depotId) {
        return jdbc.query("SELECT id, home_depot_id, type, temp, status, weight_cap_kg, volume_cap_m3, "
                + "weekly_fuel_quota_l, km_per_l FROM vehicle WHERE home_depot_id = ?", (row, number) ->
                new PlanningVehicle(row.getString("id"), row.getString("home_depot_id"),
                        VehicleType.valueOf(row.getString("type")), VehicleTemperature.valueOf(row.getString("temp")),
                        VehicleStatus.valueOf(row.getString("status")), row.getBigDecimal("weight_cap_kg"),
                        row.getBigDecimal("volume_cap_m3"), row.getBigDecimal("weekly_fuel_quota_l"),
                        row.getBigDecimal("km_per_l")), depotId);
    }

    @Override
    public Map<String, TravelProfile> findTravelProfiles(String depotId) {
        Map<String, TravelProfile> profiles = new HashMap<>();
        jdbc.query("SELECT id, depot_to_district_freeflow_min, depot_to_district_km, inter_stop_freeflow_min, "
                + "inter_stop_km FROM district WHERE depot_id = ?", (RowCallbackHandler) row -> profiles.put(
                        row.getString("id"), new TravelProfile(row.getInt("depot_to_district_freeflow_min"),
                                row.getDouble("depot_to_district_km"), row.getInt("inter_stop_freeflow_min"),
                                row.getDouble("inter_stop_km"))), depotId);
        return profiles;
    }

    @Override
    public boolean canUserAccessDepot(String email, String depotId) {
        Boolean allowed = jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM app_user WHERE email = ? AND active = true "
                + "AND role IN ('ADMIN', 'DISPATCHER') AND (role = 'ADMIN' OR depot_id = ?))",
                Boolean.class, email, depotId);
        return Boolean.TRUE.equals(allowed);
    }

    @Override
    public void saveDraftPlan(UUID planId, String depotId, LocalDate planDate, String createdByEmail) {
        jdbc.update("INSERT INTO dispatch_plan (id, depot_id, plan_date, status, rule_report, capacity_summary, created_by) "
                + "VALUES (?, ?, ?, 'DRAFT', '{}'::jsonb, '{}'::jsonb, "
                + "(SELECT id FROM app_user WHERE email = ? AND active = true))",
                planId, depotId, planDate, createdByEmail);
    }

    @Override
    public void saveTrips(UUID planId, List<TripDraft> trips) {
        for (TripDraft trip : trips) {
            UUID tripId = UUID.randomUUID();
            String tempClass = trip.orders().stream().anyMatch(order -> order.temperature() == TempClass.CHILLED)
                    ? "CHILLED" : "AMBIENT";
            jdbc.update("INSERT INTO trip (id, plan_id, vehicle_id, trip_no, brand, district_id, temp_class, "
                    + "planned_minutes, total_weight_kg, total_volume_m3, est_km, est_fuel_l, status) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')", tripId, planId, trip.vehicleId(),
                    trip.tripNo(), trip.brand().name(), trip.districtId(), tempClass, trip.minutes(),
                    trip.totalWeightKg(), trip.totalVolumeM3(), trip.fuelLitres() * trip.vehicle().kmPerL().doubleValue(),
                    trip.fuelLitres());
            int sequence = 0;
            for (PlanningOrder order : trip.orders()) {
                jdbc.update("INSERT INTO trip_stop (id, trip_id, order_id, seq, handling_allowance_min, status) "
                        + "VALUES (?, ?, ?, ?, ?, 'PLANNED')", UUID.randomUUID(), tripId, order.id(), sequence++,
                        allowances(order));
                jdbc.update("UPDATE orders SET status = 'PLANNED', version = version + 1 WHERE id = ?", order.id());
            }
        }
    }

    @Override
    public void saveDeferrals(UUID planId, List<AllocationResult.Deferral> deferrals) {
        for (AllocationResult.Deferral deferral : deferrals) {
            jdbc.update("UPDATE orders SET status = 'DEFERRED', version = version + 1 WHERE id = ?", deferral.orderId());
            jdbc.update("INSERT INTO deferral_record (id, order_id, plan_id, reason_code, unavoidable, priority_score, "
                    + "score_breakdown, notified_at) VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?)", UUID.randomUUID(),
                    deferral.orderId(), planId, deferral.reasonCode(), deferral.unavoidable(), deferral.priorityScore(),
                    scoreBreakdownJson(deferral), Timestamp.from(Instant.now(clock)));
        }
    }

    private PlanningOrder mapOrder(ResultSet row) throws SQLException {
        Brand brand = Brand.valueOf(row.getString("brand"));
        TempClass temperature = TempClass.valueOf(row.getString("temp_requirement"));
        return new PlanningOrder(row.getObject("id", UUID.class), row.getString("outlet_id"),
                row.getString("district_id"), brand, temperature,
                ParkingConstraint.valueOf(row.getString("parking_constraint")),
                DockType.valueOf(row.getString("dock_type")), row.getBigDecimal("order_weight_kg"),
                row.getBigDecimal("order_volume_m3"), temperature == TempClass.CHILLED && brand == Brand.FRESH,
                brand == Brand.FRESH || row.getString("dock_type").equals("MALL"), false,
                brand == Brand.STYLE, row.getBoolean("deferred_yesterday"), row.getInt("days_since_last_served"));
    }

    private int allowances(PlanningOrder order) {
        return new lk.waypoint.planning.domain.engine.DefaultServiceAllowances()
                .minutes(order.brand(), order.dockType());
    }

    private String scoreBreakdownJson(AllocationResult.Deferral deferral) {
        return deferral.scoreBreakdown().entrySet().stream()
                .map(entry -> "\"" + entry.getKey() + "\":" + entry.getValue())
                .collect(Collectors.joining(",", "{", "}"));
    }
}
