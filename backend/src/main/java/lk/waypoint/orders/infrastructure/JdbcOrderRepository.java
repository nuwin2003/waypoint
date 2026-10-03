package lk.waypoint.orders.infrastructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
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
                INSERT INTO orders (id, order_ref, outlet_id, product_brand, item_description, order_date, placed_at, after_cutoff,
                  temp_requirement, order_units, order_weight_kg, order_volume_m3, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, order.id(), order.orderRef(), order.outletId(), order.productBrand(), order.itemDescription(),
                order.orderDate(), Timestamp.from(order.placedAt()),
                order.afterCutoff(), order.tempRequirement().name(), order.units(), order.weightKg(),
                order.volumeM3(), order.status().name());
    }

    @Override
    public List<Order> findByOutletAndDate(String outletId, LocalDate orderDate) {
        return jdbc.query("SELECT id, order_ref, outlet_id, product_brand, item_description, order_date, placed_at, after_cutoff, "
                + "temp_requirement, order_units, order_weight_kg, order_volume_m3, status "
                + "FROM orders WHERE outlet_id = ? AND order_date = ? ORDER BY placed_at", this::map, outletId, orderDate);
    }

    @Override
    public List<Order> findByOutlet(String outletId) {
        return jdbc.query("SELECT id, order_ref, outlet_id, product_brand, item_description, order_date, placed_at, after_cutoff, "
                + "temp_requirement, order_units, order_weight_kg, order_volume_m3, status "
                + "FROM orders WHERE outlet_id = ? ORDER BY order_date DESC, placed_at DESC", this::map, outletId);
    }

    @Override
    public Optional<String> findActiveOutletForUser(String email) {
        return jdbc.query("SELECT u.outlet_id FROM app_user u JOIN outlet o ON o.id = u.outlet_id "
                        + "WHERE u.email = ? AND u.active = true AND u.role = 'STORE_MANAGER' AND o.active = true",
                (row, number) -> row.getString("outlet_id"), email).stream().findFirst();
    }

    @Override
    public boolean canUserAccessOutlet(String email, String outletId) {
        Boolean allowed = jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM app_user u "
                + "JOIN outlet o ON o.id = ? AND o.active = true "
                + "WHERE u.email = ? AND u.active = true "
                + "AND (u.role = 'ADMIN' OR (u.role = 'DISPATCHER' AND u.depot_id = o.depot_id))",
                Boolean.class, outletId, email);
        return Boolean.TRUE.equals(allowed);
    }

    private Order map(ResultSet result, int row) throws SQLException {
        return new Order(result.getObject("id", UUID.class), result.getString("order_ref"),
                result.getString("outlet_id"), result.getString("product_brand"), result.getString("item_description"),
                result.getObject("order_date", LocalDate.class),
                result.getTimestamp("placed_at").toInstant(), result.getBoolean("after_cutoff"),
                TempRequirement.valueOf(result.getString("temp_requirement")), result.getInt("order_units"),
                result.getBigDecimal("order_weight_kg"), result.getBigDecimal("order_volume_m3"),
                OrderStatus.valueOf(result.getString("status")));
    }
}
