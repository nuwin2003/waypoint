package lk.waypoint.orders.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
    public OrderResponse place(@Valid @RequestBody CreateOrderRequest request) {
        return OrderResponse.from(service.place(request.outletId(), request.deliveryDate(), request.tempRequirement(),
                request.units(), request.weightKg(), request.volumeM3()));
    }

    @GetMapping
    public List<OrderResponse> list(@RequestParam String outletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate orderDate) {
        return service.list(outletId, orderDate).stream().map(OrderResponse::from).toList();
    }

    public record CreateOrderRequest(
            @NotBlank String outletId,
            @NotNull LocalDate deliveryDate,
            @NotNull TempRequirement tempRequirement,
            @Min(1) int units,
            @NotNull @DecimalMin("0.01") BigDecimal weightKg,
            @NotNull @DecimalMin("0.001") BigDecimal volumeM3) { }

    public record OrderResponse(String id, String orderRef, String outletId, LocalDate orderDate,
            boolean afterCutoff, TempRequirement tempRequirement, int units, BigDecimal weightKg,
            BigDecimal volumeM3, String status) {
        static OrderResponse from(Order order) {
            return new OrderResponse(order.id().toString(), order.orderRef(), order.outletId(), order.orderDate(),
                    order.afterCutoff(), order.tempRequirement(), order.units(), order.weightKg(),
                    order.volumeM3(), order.status().name());
        }
    }
}
