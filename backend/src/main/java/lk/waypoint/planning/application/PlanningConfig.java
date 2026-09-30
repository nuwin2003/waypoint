package lk.waypoint.planning.application;

import lk.waypoint.planning.domain.engine.Allocator;
import lk.waypoint.planning.domain.engine.DefaultServiceAllowances;
import lk.waypoint.planning.domain.engine.PriorityScorer;
import lk.waypoint.planning.domain.engine.RuleValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PlanningConfig {
    @Bean
    Allocator allocator() {
        return new Allocator(new RuleValidator(), new PriorityScorer(), new DefaultServiceAllowances());
    }
}
