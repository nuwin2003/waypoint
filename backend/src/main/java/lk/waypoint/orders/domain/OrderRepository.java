package lk.waypoint.orders.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface OrderRepository {
    void save(Order order);
    List<Order> findByOutletAndDate(String outletId, LocalDate orderDate);
}
