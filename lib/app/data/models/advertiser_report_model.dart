class AdvertiserReportModel {
  final String id;
  final String title;
  final String format; // 'PDF' | 'XLSX' | 'CSV'
  final String generatedOn;
  final String status; // 'ready' | 'processing'
  final String? fileUrl;
  final Map<String, dynamic> summary;

  AdvertiserReportModel({
    required this.id,
    required this.title,
    required this.format,
    required this.generatedOn,
    this.status = 'ready',
    this.fileUrl,
    this.summary = const {},
  });

  factory AdvertiserReportModel.fromJson(Map<String, dynamic> json) {
    final formatVal = (json['file_format'] ?? json['format'] ?? 'csv').toString().toUpperCase();
    final dateVal = json['created_at'] ?? json['createdAt'] ?? json['generatedOn'];
    String formattedDate = '—';
    if (dateVal != null) {
      try {
        final parsed = DateTime.parse(dateVal.toString());
        formattedDate =
            '${parsed.day.toString().padLeft(2, '0')}/${parsed.month.toString().padLeft(2, '0')}/${parsed.year} ${parsed.hour.toString().padLeft(2, '0')}:${parsed.minute.toString().padLeft(2, '0')}';
      } catch (_) {
        formattedDate = dateVal.toString();
      }
    }

    final rawType = json['report_type'] ?? json['reportType'] ?? json['type'];
    final title = json['title'] ??
        (rawType == 'campaign_performance'
            ? 'Proof-of-Play Performance Audit'
            : (rawType?.toString() ?? 'Proof-of-Play Performance Audit'));

    return AdvertiserReportModel(
      id: json['id']?.toString() ?? '—',
      title: title.toString(),
      format: formatVal,
      generatedOn: formattedDate,
      status: json['status']?.toString() ?? 'ready',
      fileUrl: json['file_url']?.toString() ?? json['fileUrl']?.toString(),
      summary: json['summary'] is Map ? Map<String, dynamic>.from(json['summary']) : {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'file_format': format.toLowerCase(),
      'created_at': generatedOn,
      'status': status,
      if (fileUrl != null) 'file_url': fileUrl,
      'summary': summary,
    };
  }
}

