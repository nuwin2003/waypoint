package lk.waypoint.admin.application;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lk.waypoint.auth.application.AuthApplicationService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserApplicationService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public AdminUserApplicationService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserSummary> list() {
        return jdbc.query("""
                SELECT u.id, u.email, u.role, u.outlet_id, o.name AS outlet_name,
                       u.depot_id, d.name AS depot_name, u.vehicle_id, u.active
                FROM app_user u
                LEFT JOIN outlet o ON o.id = u.outlet_id
                LEFT JOIN depot d ON d.id = u.depot_id
                ORDER BY u.email
                """, (row, number) -> new UserSummary(
                row.getObject("id", UUID.class),
                row.getString("email"),
                row.getString("role"),
                row.getString("outlet_id"),
                row.getString("outlet_name"),
                row.getString("depot_id"),
                row.getString("depot_name"),
                row.getString("vehicle_id"),
                row.getBoolean("active")));
    }

    @Transactional
    public UserSummary create(String email, String password, String role,
            String outletId, String depotId, String vehicleId) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String storedRole = role.equals("STOREKEEPER") ? "STORE_MANAGER" : role;
        validateAssignment(storedRole, depotId, vehicleId, null);
        if ("DRIVER".equals(storedRole) && (depotId == null || depotId.isBlank())) {
            depotId = findVehicleDepot(vehicleId);
        }
        UUID id = UUID.randomUUID();
        try {
            jdbc.update("""
                    INSERT INTO app_user(id, email, password_hash, role, outlet_id, depot_id, vehicle_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, id, normalizedEmail, passwordEncoder.encode(password), storedRole,
                    outletId, depotId, vehicleId);
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists", exception);
        }
        return find(id);
    }

    @Transactional
    public UserSummary setAssignment(UUID id, String depotId, String vehicleId) {
        UserSummary user = find(id);
        String storedRole = user.role();
        validateAssignment(storedRole, depotId, vehicleId, id);
        int changed = jdbc.update("""
                UPDATE app_user SET depot_id = ?, vehicle_id = ?
                WHERE id = ?
                """, depotId, vehicleId, id);
        if (changed == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User was not found");
        }
        return find(id);
    }

    @Transactional
    public UserSummary setActive(UUID id, boolean active) {
        int changed = jdbc.update("UPDATE app_user SET active = ? WHERE id = ?", active, id);
        if (changed == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User was not found");
        }
        return find(id);
    }

    private UserSummary find(UUID id) {
        return jdbc.query("""
                SELECT u.id, u.email, u.role, u.outlet_id, o.name AS outlet_name,
                       u.depot_id, d.name AS depot_name, u.vehicle_id, u.active
                FROM app_user u
                LEFT JOIN outlet o ON o.id = u.outlet_id
                LEFT JOIN depot d ON d.id = u.depot_id
                WHERE u.id = ?
                """, (row, number) -> new UserSummary(
                row.getObject("id", UUID.class),
                row.getString("email"),
                row.getString("role"),
                row.getString("outlet_id"),
                row.getString("outlet_name"),
                row.getString("depot_id"),
                row.getString("depot_name"),
                row.getString("vehicle_id"),
                row.getBoolean("active")), id).stream().findFirst().orElseThrow();
    }

    private void validateAssignment(String role, String depotId, String vehicleId, UUID currentUserId) {
        if ("DRIVER".equals(role) && (vehicleId == null || vehicleId.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A Driver account must have an assigned vehicle");
        }
        if (vehicleId == null || vehicleId.isBlank()) return;
        var vehicles = jdbc.query("""
                SELECT home_depot_id FROM vehicle
                WHERE id = ? AND status = 'AVAILABLE'
                """, (row, number) -> row.getString("home_depot_id"), vehicleId);
        if (vehicles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The selected vehicle does not exist or is not available");
        }
        String vehicleDepot = vehicles.getFirst();
        if (depotId != null && !depotId.isBlank() && !vehicleDepot.equals(depotId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The vehicle belongs to a different depot");
        }
        var assigned = currentUserId == null
                ? jdbc.query("SELECT id FROM app_user WHERE vehicle_id = ? AND active = true", (row, number) -> row.getObject("id", UUID.class), vehicleId)
                : jdbc.query("SELECT id FROM app_user WHERE vehicle_id = ? AND active = true AND id <> ?", (row, number) -> row.getObject("id", UUID.class), vehicleId, currentUserId);
        if (!assigned.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "That vehicle is already assigned to an active account");
        }
    }

    private String findVehicleDepot(String vehicleId) {
        return jdbc.query("SELECT home_depot_id FROM vehicle WHERE id = ?",
                (row, number) -> row.getString("home_depot_id"), vehicleId).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The selected vehicle does not exist"));
    }

    public record UserSummary(UUID id, String email, String role, String outletId,
            String outletName, String depotId, String depotName, String vehicleId,
            boolean active) {
        public String apiRole() {
            return role.equals("STORE_MANAGER") ? "STOREKEEPER" : role;
        }
    }

    public record CreateUserCommand(String email, String password, String role,
            String outletId, String depotId, String vehicleId) { }
}
