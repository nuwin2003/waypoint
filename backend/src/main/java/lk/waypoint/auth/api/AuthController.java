package lk.waypoint.auth.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lk.waypoint.auth.application.AuthApplicationService;
import lk.waypoint.auth.application.AuthApplicationService.LoginResult;
import lk.waypoint.auth.application.AuthApplicationService.CreatedUserResult;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthApplicationService service;

    public AuthController(AuthApplicationService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public LoginResult login(@Valid @RequestBody LoginRequest request) {
        return service.login(request.email(), request.password());
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedUserResult signup(@Valid @RequestBody SignupRequest request) {
        return service.signup(request.email(), request.password(), request.role(),
                request.outletId(), request.depotId(), request.vehicleId());
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) { }
    public record SignupRequest(
            @Email @NotBlank @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Pattern(regexp = "STOREKEEPER|STORE_MANAGER|DISPATCHER|LOADER|DRIVER") String role,
            @Size(max = 16) String outletId,
            @Size(max = 32) String depotId,
            @Size(max = 16) String vehicleId) { }
}
