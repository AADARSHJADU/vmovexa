import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../app/data/services/storage_service.dart';
import '../models/language_model.dart';

class LocalizationService extends GetxService {
  static LocalizationService get to => Get.find<LocalizationService>();

  static const Locale fallbackLocale = Locale('en', 'US');

  final Rx<LanguageModel> currentLanguage = LanguageModel.supportedLanguages.first.obs;

  static Locale get currentLocale {
    if (Get.isRegistered<StorageService>()) {
      final langCode = StorageService.to.getLanguageCode();
      final countryCode = StorageService.to.getCountryCode();
      return Locale(langCode, countryCode);
    }
    return fallbackLocale;
  }

  @override
  void onInit() {
    super.onInit();
    _loadSavedLanguage();
  }

  void _loadSavedLanguage() {
    if (Get.isRegistered<StorageService>()) {
      final langCode = StorageService.to.getLanguageCode();
      final countryCode = StorageService.to.getCountryCode();
      final match = LanguageModel.supportedLanguages.firstWhereOrNull(
        (l) => l.languageCode == langCode && l.countryCode == countryCode,
      );
      if (match != null) {
        currentLanguage.value = match;
      }
    }
  }

  Future<void> changeLanguage(LanguageModel language) async {
    currentLanguage.value = language;
    await Get.updateLocale(language.locale);
    if (Get.isRegistered<StorageService>()) {
      await StorageService.to.saveLanguage(language.languageCode, language.countryCode);
    }
  }

  bool isCurrent(LanguageModel lang) {
    return currentLanguage.value.languageCode == lang.languageCode &&
        currentLanguage.value.countryCode == lang.countryCode;
  }
}
