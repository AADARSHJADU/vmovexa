import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class DeviceFileSaver {
  /// Writes text or bytes directly to Android public Downloads directory (/storage/emulated/0/Download)
  static Future<String> saveFile({
    required String fileName,
    String? content,
    List<int>? bytes,
    String? remoteUrl,
  }) async {
    List<int>? fileBytes = bytes;
    if ((fileBytes == null || fileBytes.isEmpty) && remoteUrl != null && remoteUrl.isNotEmpty) {
      try {
        String fullUrl = remoteUrl;
        if (!fullUrl.startsWith('http')) {
          fullUrl = 'https://api.vmovexa.com$remoteUrl';
        }
        final resp = await http.get(Uri.parse(fullUrl));
        if (resp.statusCode == 200) {
          fileBytes = resp.bodyBytes;
        }
      } catch (e) {
        debugPrint('DeviceFileSaver remote download error: $e');
      }
    }

    // 1. Try Android Public Download folder
    try {
      final downloadDir = Directory('/storage/emulated/0/Download');
      if (await downloadDir.exists()) {
        final targetFile = File('${downloadDir.path}/$fileName');
        if (fileBytes != null && fileBytes.isNotEmpty) {
          await targetFile.writeAsBytes(fileBytes);
        } else if (content != null) {
          await targetFile.writeAsString(content);
        }
        return targetFile.path;
      }
    } catch (e) {
      debugPrint('DeviceFileSaver downloadDir error: $e');
    }

    // 2. Try System Temp fallback
    try {
      final tempDir = Directory.systemTemp;
      final targetFile = File('${tempDir.path}/$fileName');
      if (fileBytes != null && fileBytes.isNotEmpty) {
        await targetFile.writeAsBytes(fileBytes);
      } else if (content != null) {
        await targetFile.writeAsString(content);
      }
      return targetFile.path;
    } catch (e) {
      debugPrint('DeviceFileSaver fallback storage write error: $e');
    }

    return fileName;
  }

  /// Displays standard success snackbar with actual saved path
  static void showSuccessSnackbar({
    required String title,
    required String filePath,
    String? copyContent,
  }) {
    if (copyContent != null && copyContent.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: copyContent));
    }

    Get.snackbar(
      title,
      'Saved to $filePath',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      duration: const Duration(seconds: 4),
      icon: const Icon(Icons.download_done_rounded, color: Colors.white),
      margin: const EdgeInsets.all(12),
      borderRadius: 12,
    );
  }
}

