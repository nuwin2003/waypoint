package lk.waypoint.masterdata.application;

import java.util.List;
import lk.waypoint.masterdata.domain.OutletSummary;
import lk.waypoint.masterdata.domain.VehicleSummary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MasterDataApplicationService {
    private final JdbcTemplate jdbc;

    public MasterDataApplicationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public List<OutletSummary> outlets(String depotId) {
        String sql = "SELECT id, name, brand, district_id, depot_id, parking_constraint, dock_type "
                + "FROM outlet WHERE active = true";
        if (depotId == null || depotId.isBlank()) {
            return jdbc.query(sql + " ORDER BY id", (row, number) -> new OutletSummary(row.getString("id"),
                    row.getString("name"), row.getString("brand"), row.getString("district_id"),
                    row.getString("depot_id"), row.getString("parking_constraint"), row.getString("dock_type")));
        }
        return jdbc.query(sql + " AND depot_id = ? ORDER BY id", (row, number) -> new OutletSummary(row.getString("id"),
                row.getString("name"), row.getString("brand"), row.getString("district_id"),
                row.getString("depot_id"), row.getString("parking_constraint"), row.getString("dock_type")), depotId);
    }

    @Transactional(readOnly = true)
    public List<VehicleSummary> vehicles(String depotId) {
        String sql = "SELECT id, home_depot_id, type, temp, status, weight_cap_kg, volume_cap_m3 "
                + "FROM vehicle";
        if (depotId == null || depotId.isBlank()) {
            return jdbc.query(sql + " ORDER BY id", this::mapVehicle);
        }
        return jdbc.query(sql + " WHERE home_depot_id = ? ORDER BY id", this::mapVehicle, depotId);
    }

    private VehicleSummary mapVehicle(java.sql.ResultSet row, int number) throws java.sql.SQLException {
        return new VehicleSummary(row.getString("id"), row.getString("home_depot_id"), row.getString("type"),
                row.getString("temp"), row.getString("status"), row.getBigDecimal("weight_cap_kg"),
                row.getBigDecimal("volume_cap_m3"));
    }
}
