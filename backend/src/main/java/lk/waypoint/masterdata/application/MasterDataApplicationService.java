package lk.waypoint.masterdata.application;

import java.util.List;
import lk.waypoint.masterdata.domain.MasterDataRepository;
import lk.waypoint.masterdata.domain.OutletSummary;
import lk.waypoint.masterdata.domain.VehicleSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MasterDataApplicationService {
    private final MasterDataRepository repository;

    public MasterDataApplicationService(MasterDataRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<OutletSummary> outlets(String depotId) {
        return repository.findOutlets(depotId);
    }

    @Transactional(readOnly = true)
    public List<VehicleSummary> vehicles(String depotId) {
        return repository.findVehicles(depotId);
    }
}
