package lk.waypoint.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final JdbcTemplate jdbc;

    public JwtAuthenticationFilter(JwtService jwtService, JdbcTemplate jdbc) {
        this.jwtService = jwtService;
        this.jdbc = jdbc;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long startedAt = System.nanoTime();
        log.info("http.start method={} path={}", request.getMethod(), request.getRequestURI());
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7));
                String role = claims.get("role", String.class);
                String email = claims.getSubject();
                var currentRoles = jdbc.query("SELECT role FROM app_user WHERE email = ? AND active = true",
                        (row, number) -> row.getString("role"), email);
                String currentRole = currentRoles.isEmpty() ? null
                        : currentRoles.getFirst().equals("STORE_MANAGER") ? "STOREKEEPER" : currentRoles.getFirst();
                if (role != null && role.equals(currentRole)) {
                    var authentication = new UsernamePasswordAuthenticationToken(email, null,
                            java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.warn("jwt.authentication.rejected reason={}", "inactive-user-or-role-changed");
                    SecurityContextHolder.clearContext();
                }
            } catch (RuntimeException exception) {
                log.warn("jwt.authentication.failed exception={}", exception.getClass().getSimpleName());
                SecurityContextHolder.clearContext();
            }
        }
        try {
            chain.doFilter(request, response);
        } catch (ServletException | IOException exception) {
            log.warn("http.error method={} path={} exception={}", request.getMethod(), request.getRequestURI(),
                    exception.getClass().getSimpleName());
            throw exception;
        } finally {
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info("http.end method={} path={} status={} elapsedMs={}", request.getMethod(),
                    request.getRequestURI(), response.getStatus(), elapsedMs);
        }
    }
}
