package lk.waypoint.orders.infrastructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lk.waypoint.orders.domain.Order;
import lk.waypoint.orders.domain.OrderRepository;
import lk.waypoint.orders.domain.OrderStatus;
import lk.waypoint.orders.domain.TempRequirement;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOrderRepository implements OrderRepository {
    private final JdbcTemplate jdbc;

    public JdbcOrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void save(Order order) {
        jdbc.update("""
                INSERT INTO orders (id, order_ref, outlet_id, order_date, placed_at, after_cutoff,
                  temp_requirement, order_units, order_weight_kg, order_volume_m3, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, order.id(), order.orderRef(), order.outletId(), order.orderDate(), order.placedAt(),
                order.afterCutoff(), order.tempRequirement().name(), order.units(), order.weightKg(),
                order.volumeM3(), order.status().name());
    }

    @Override
    public List<Order> findByOutletAndDate(String outletId, LocalDate orderDate) {
        return jdbc.query("SELECT id, order_ref, outlet_id, order_date, placed_at, after_cutoff, "
                + "temp_requirement, order_units, order_weight_kg, order_volume_m3, status "
                + "FROM orders WHERE outlet_id = ? AND order_date = ? ORDER BY placed_at", this::map, outletId, orderDate);
    }

    private Order map(ResultSet result, int row) throws SQLException {
        return new Order(result.getObject("id", UUID.class), result.getString("order_ref"),
                result.getString("outlet_id"), result.getObject("order_date", LocalDate.class),
                result.getTimestamp("placed_at").toInstant(), result.getBoolean("after_cutoff"),
                TempRequirement.valueOf(result.getString("temp_requirement")), result.getInt("order_units"),
                result.getBigDecimal("order_weight_kg"), result.getBigDecimal("order_volume_m3"),
                OrderStatus.valueOf(result.getString("status")));
    }
}
