package lk.waypoint.admin.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import lk.waypoint.admin.application.AdminUserApplicationService;
import lk.waypoint.admin.application.AdminUserApplicationService.UserSummary;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {
    private final AdminUserApplicationService service;

    public AdminUserController(AdminUserApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.list().stream().map(UserResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return UserResponse.from(service.create(request.email(), request.password(), request.role(),
                request.outletId(), request.depotId(), request.vehicleId()));
    }

    @PatchMapping("/{id}/status")
    public UserResponse setStatus(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
        return UserResponse.from(service.setActive(id, request.active()));
    }

    public record CreateUserRequest(
            @Email @NotBlank @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Pattern(regexp = "ADMIN|STOREKEEPER|DISPATCHER|LOADER|DRIVER") String role,
            @Size(max = 16) String outletId,
            @Size(max = 32) String depotId,
            @Size(max = 16) String vehicleId) { }

    public record StatusRequest(boolean active) { }

    public record UserResponse(UUID id, String email, String role, String outletId,
            String outletName, String depotId, String depotName, String vehicleId,
            boolean active) {
        static UserResponse from(UserSummary user) {
            return new UserResponse(user.id(), user.email(), user.apiRole(), user.outletId(),
                    user.outletName(), user.depotId(), user.depotName(), user.vehicleId(), user.active());
        }
    }
}
