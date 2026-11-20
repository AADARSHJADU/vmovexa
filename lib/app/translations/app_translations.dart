import 'package:get/get.dart';
import 'locales/en_us.dart';
import 'locales/hi_in.dart';
import 'locales/mr_in.dart';
import 'locales/gu_in.dart';
import 'locales/kn_in.dart';
import 'locales/te_in.dart';
import 'locales/ta_in.dart';
import 'locales/ml_in.dart';
import 'locales/bn_in.dart';
import 'locales/pa_in.dart';

class AppTranslations extends Translations {
  @override
  Map<String, Map<String, String>> get keys => {
        'en_US': enUS,
        'hi_IN': hiIN,
        'mr_IN': mrIN,
        'gu_IN': guIN,
        'kn_IN': knIN,
        'te_IN': teIN,
        'ta_IN': taIN,
        'ml_IN': mlIN,
        'bn_IN': bnIN,
        'pa_IN': paIN,
      };
}
