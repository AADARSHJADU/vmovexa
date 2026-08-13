class VehicleDetails {
  final String name;
  final String status; // Active / In Maintenance / Inactive
  final String vehicleType;
  final String depotLocation;
  final String capacity;
  final String driver;
  final String route;
  final String imageAsset; // asset path or network URL; empty = placeholder

  VehicleDetails({
    required this.name,
    required this.status,
    required this.vehicleType,
    required this.depotLocation,
    required this.capacity,
    required this.driver,
    required this.route,
    this.imageAsset = '',
  });
}
