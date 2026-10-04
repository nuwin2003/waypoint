package lk.waypoint.orders.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface OrderRepository {
    void save(Order order);
    List<Order> findByOutletAndDate(String outletId, LocalDate orderDate);
    List<Order> findByOutlet(String outletId);
    Optional<String> findActiveOutletForUser(String email);
    boolean canUserAccessOutlet(String email, String outletId);
    Optional<Order> receive(UUID orderId, String outletId);
}
