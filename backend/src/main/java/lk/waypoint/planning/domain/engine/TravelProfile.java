package lk.waypoint.planning.domain.engine;

public record TravelProfile(int depotToDistrictMinutes, double depotToDistrictKm,
        int interStopMinutes, double interStopKm) { }
