import 'package:flutter/material.dart';

class LanguageModel {
  final String name;
  final String nativeName;
  final String languageCode;
  final String countryCode;

  const LanguageModel({
    required this.name,
    required this.nativeName,
    required this.languageCode,
    required this.countryCode,
  });

  Locale get locale => Locale(languageCode, countryCode);

  String get localeKey => '${languageCode}_$countryCode';

  static const List<LanguageModel> supportedLanguages = [
    LanguageModel(
      name: 'English',
      nativeName: 'English',
      languageCode: 'en',
      countryCode: 'US',
    ),
    LanguageModel(
      name: 'Hindi',
      nativeName: 'हिन्दी',
      languageCode: 'hi',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Marathi',
      nativeName: 'मराठी',
      languageCode: 'mr',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      languageCode: 'kn',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Telugu',
      nativeName: 'తెలుగు',
      languageCode: 'te',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Tamil',
      nativeName: 'தமிழ்',
      languageCode: 'ta',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      languageCode: 'ml',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      languageCode: 'gu',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Bengali',
      nativeName: 'বাংলা',
      languageCode: 'bn',
      countryCode: 'IN',
    ),
    LanguageModel(
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      languageCode: 'pa',
      countryCode: 'IN',
    ),
  ];
}
