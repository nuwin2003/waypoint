package lk.waypoint.common;

import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Request validation failed");
        problem.setType(URI.create("https://waypoint.lk/problems/validation"));
        problem.setProperty("code", "VALIDATION_ERROR");
        return problem;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail dataConflict(DataIntegrityViolationException exception) {
        log.warn("api.error type={} exception={}", "DATA_CONFLICT", exception.getClass().getSimpleName());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "The request conflicts with existing data");
        problem.setType(URI.create("https://waypoint.lk/problems/data-conflict"));
        problem.setProperty("code", "DATA_CONFLICT");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception exception) {
        HttpStatusCode status = HttpStatus.INTERNAL_SERVER_ERROR;
        ResponseStatus responseStatus = exception.getClass().getAnnotation(ResponseStatus.class);
        if (responseStatus != null) {
            status = responseStatus.code();
        } else if (exception instanceof ResponseStatusException responseStatusException) {
            status = responseStatusException.getStatusCode();
        }
        log.error("api.error type={} exception={}", status.is5xxServerError() ? "INTERNAL" : "REQUEST",
                exception.getClass().getSimpleName(), exception);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status,
                exception instanceof ResponseStatusException responseStatusException
                        ? responseStatusException.getReason()
                        : status.is5xxServerError() ? "An unexpected error occurred" : "The request could not be processed");
        problem.setType(URI.create("https://waypoint.lk/problems/request-error"));
        problem.setProperty("code", status.is5xxServerError() ? "INTERNAL_ERROR" : "REQUEST_ERROR");
        return problem;
    }
}
