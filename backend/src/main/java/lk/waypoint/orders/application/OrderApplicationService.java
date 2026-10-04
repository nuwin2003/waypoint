package lk.waypoint.orders.application;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lk.waypoint.orders.domain.Order;
import lk.waypoint.orders.domain.OrderCutoffPolicy;
import lk.waypoint.orders.domain.OrderRepository;
import lk.waypoint.orders.domain.OrderStatus;
import lk.waypoint.orders.domain.TempRequirement;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderApplicationService {
    private final OrderRepository repository;
    private final Clock clock;

    public OrderApplicationService(OrderRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public Order place(String email, String productBrand, String itemDescription, LocalDate requestedDate, TempRequirement temperature,
                       int units, BigDecimal weightKg, BigDecimal volumeM3) {
        String outletId = repository.findActiveOutletForUser(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is not assigned to an active outlet"));
        OrderCutoffPolicy.Decision decision = OrderCutoffPolicy.decide(requestedDate, clock);
        UUID id = UUID.randomUUID();
        Order order = new Order(id, "WPT-" + id.toString().substring(0, 8).toUpperCase(), outletId,
                productBrand, itemDescription,
                decision.effectiveDate(), Instant.now(clock), decision.afterCutoff(), temperature,
                units, weightKg, volumeM3, decision.afterCutoff() ? OrderStatus.NEXT_RUN : OrderStatus.PLACED);
        repository.save(order);
        return order;
    }

    @Transactional(readOnly = true)
    public List<Order> list(String outletId, LocalDate orderDate) {
        return orderDate == null ? repository.findByOutlet(outletId)
                : repository.findByOutletAndDate(outletId, orderDate);
    }

    @Transactional(readOnly = true)
    public List<Order> listForUser(String email, LocalDate orderDate) {
        String outletId = repository.findActiveOutletForUser(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is not assigned to an active outlet"));
        return orderDate == null ? repository.findByOutlet(outletId)
                : repository.findByOutletAndDate(outletId, orderDate);
    }

    @Transactional
    public Order receive(String email, UUID orderId) {
        String outletId = repository.findActiveOutletForUser(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is not assigned to an active outlet"));
        return repository.receive(orderId, outletId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT,
                        "Order was not found or already received"));
    }

    @Transactional(readOnly = true)
    public List<Order> listForDispatcher(String email, String outletId, LocalDate orderDate) {
        if (!repository.canUserAccessOutlet(email, outletId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your dispatcher account is not assigned to this outlet's depot");
        }
        return orderDate == null ? repository.findByOutlet(outletId)
                : repository.findByOutletAndDate(outletId, orderDate);
    }
}
