package lk.waypoint.auth.application;

import java.util.Locale;
import java.util.UUID;
import lk.waypoint.security.JwtService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthApplicationService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthApplicationService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResult login(String email, String password) {
        var users = jdbc.query("SELECT email, password_hash, role FROM app_user WHERE email = ? AND active = true",
                (row, number) -> new UserRow(row.getString("email"), row.getString("password_hash"), row.getString("role")),
                email.toLowerCase(Locale.ROOT));
        if (users.isEmpty() || !passwordEncoder.matches(password, users.getFirst().passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        UserRow user = users.getFirst();
        String role = user.role().equals("STORE_MANAGER") ? "STOREKEEPER" : user.role();
        return new LoginResult(jwtService.issue(user.email(), role), user.email(), role,
                displayName(role));
    }

    @Transactional
    public CreatedUserResult signup(String email, String password, String requestedRole,
            String outletId, String depotId, String vehicleId) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String role = requestedRole.equals("STOREKEEPER") ? "STORE_MANAGER" : requestedRole;
        UUID userId = UUID.randomUUID();

        try {
            jdbc.update("""
                    INSERT INTO app_user(id, email, password_hash, role, outlet_id, depot_id, vehicle_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, userId, normalizedEmail, passwordEncoder.encode(password), role,
                    outletId, depotId, vehicleId);
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        String apiRole = role.equals("STORE_MANAGER") ? "STOREKEEPER" : role;
        return new CreatedUserResult(normalizedEmail, apiRole, displayName(apiRole));
    }

    private String displayName(String role) {
        return switch (role) {
            case "ADMIN" -> "Admin";
            case "STOREKEEPER" -> "Storekeeper";
            case "DISPATCHER" -> "Dispatcher";
            case "LOADER" -> "Loader";
            case "DRIVER" -> "Driver";
            default -> role;
        };
    }

    private record UserRow(String email, String passwordHash, String role) { }
    public record LoginResult(String accessToken, String email, String role, String displayName) { }
    public record CreatedUserResult(String email, String role, String displayName) { }
}
