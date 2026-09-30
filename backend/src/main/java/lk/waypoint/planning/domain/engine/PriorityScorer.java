package lk.waypoint.planning.domain.engine;

import java.util.LinkedHashMap;
import java.util.Map;

public final class PriorityScorer {
    public Score score(PlanningOrder order) {
        Map<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put("deferredYesterday", order.deferredYesterday() ? 40 : 0);
        breakdown.put("daysSinceLastServed", 5 * Math.min(order.daysSinceLastServed(), 6));
        breakdown.put("chilledPerishable", order.chilledPerishable() && order.brand() == Brand.FRESH ? 20 : 0);
        breakdown.put("tightWindow", order.tightWindow() ? 15 : 0);
        breakdown.put("festivalRamp", order.festivalRamp() && order.brand() == Brand.FRESH ? 10 : 0);
        breakdown.put("lowValueOrDeferrable", order.lowValueOrDeferrable() ? -10 : 0);
        return new Score(breakdown.values().stream().mapToInt(Integer::intValue).sum(), breakdown);
    }

    public record Score(int value, Map<String, Integer> breakdown) { }
}
