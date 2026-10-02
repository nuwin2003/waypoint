package lk.waypoint.orders.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.security.Principal;
import org.springframework.security.core.Authentication;
import lk.waypoint.orders.application.OrderApplicationService;
import lk.waypoint.orders.domain.Order;
import lk.waypoint.orders.domain.TempRequirement;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderApplicationService service;

    public OrderController(OrderApplicationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@Valid @RequestBody CreateOrderRequest request, Principal principal) {
        return OrderResponse.from(service.place(principal.getName(), request.productBrand(), request.itemDescription(),
                request.deliveryDate(), request.tempRequirement(),
                request.units(), request.weightKg(), request.volumeM3()));
    }

    @GetMapping
    public List<OrderResponse> list(@RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate orderDate,
            Authentication authentication) {
        boolean storekeeper = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STOREKEEPER"));
        boolean dispatcher = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DISPATCHER"));
        if (!storekeeper && (outletId == null || outletId.isBlank())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "outletId is required for this role");
        }
        var orders = storekeeper ? service.listForUser(authentication.getName(), orderDate)
                : dispatcher ? service.listForDispatcher(authentication.getName(), outletId, orderDate)
                : service.list(outletId, orderDate);
        return orders.stream().map(OrderResponse::from).toList();
    }

    public record CreateOrderRequest(
            @NotBlank @Pattern(regexp = "FRESH|STYLE|TECH") String productBrand,
            @NotBlank @Size(max = 160) String itemDescription,
            @NotNull LocalDate deliveryDate,
            @NotNull TempRequirement tempRequirement,
            @Min(1) int units,
            @NotNull @DecimalMin("0.01") BigDecimal weightKg,
            @NotNull @DecimalMin("0.001") BigDecimal volumeM3) { }

    public record OrderResponse(String id, String orderRef, String outletId, String productBrand,
            String itemDescription, LocalDate orderDate,
            boolean afterCutoff, TempRequirement tempRequirement, int units, BigDecimal weightKg,
            BigDecimal volumeM3, String status) {
        static OrderResponse from(Order order) {
            return new OrderResponse(order.id().toString(), order.orderRef(), order.outletId(), order.productBrand(),
                    order.itemDescription(), order.orderDate(),
                    order.afterCutoff(), order.tempRequirement(), order.units(), order.weightKg(),
                    order.volumeM3(), order.status().name());
        }
    }
}
