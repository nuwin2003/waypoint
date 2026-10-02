package lk.waypoint.planning.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.security.core.Authentication;
import lk.waypoint.planning.application.PlanRunApplicationService;
import lk.waypoint.planning.application.PlanRunApplicationService.PlanRunResult;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/plans")
public class PlanController {
    private final PlanRunApplicationService service;

    public PlanController(PlanRunApplicationService service) {
        this.service = service;
    }

    @PostMapping("/run")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanRunResult run(@Valid @RequestBody RunPlanRequest request, Authentication authentication) {
        return service.run(request.depotId(), request.planDate(), authentication.getName());
    }

    public record RunPlanRequest(@NotBlank String depotId, @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate planDate) { }
}
