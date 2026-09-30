package lk.waypoint.masterdata.api;

import java.util.List;
import lk.waypoint.masterdata.application.MasterDataApplicationService;
import lk.waypoint.masterdata.domain.OutletSummary;
import lk.waypoint.masterdata.domain.VehicleSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MasterDataController {
    private final MasterDataApplicationService service;

    public MasterDataController(MasterDataApplicationService service) {
        this.service = service;
    }

    @GetMapping("/outlets")
    public List<OutletSummary> outlets(@RequestParam(required = false) String depotId) {
        return service.outlets(depotId);
    }

    @GetMapping("/vehicles/availability")
    public List<VehicleSummary> vehicles(@RequestParam(required = false) String depotId) {
        return service.vehicles(depotId);
    }
}
