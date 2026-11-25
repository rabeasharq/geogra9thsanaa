import { AtlasLocation } from '../types/textbook';

/**
 * Projection helpers matching our 1000x600 SVG maps:
 * Yemen: lng [41.5..55.5], lat [11.5..19.5]
 * Arab World: lng [-18..62], lat [-2..38] (Comoros shown in inset box)
 */
export function projectYemen(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - 41.5) / 14.0) * 900 + 50;
  const y = ((19.5 - lat) / 8.0) * 520 + 40;
  return { x: Math.round(x), y: Math.round(y) };
}

export function projectArabWorld(lat: number, lng: number, isComorosInset = false): { x: number; y: number } {
  if (isComorosInset) {
    return { x: 865, y: 490 };
  }
  const x = ((lng + 18) / 80.0) * 920 + 40;
  const y = ((38 - lat) / 40.0) * 520 + 40;
  return { x: Math.round(x), y: Math.round(y) };
}

export const ATLAS_LOCATIONS: AtlasLocation[] = [
  // ================= YEMEN LOCATIONS =================
  {
    id: 'loc-yemen-center',
    name: 'الموقع الفلكي والجغرافي للجمهورية اليمنية',
    shortLabel: 'وسط اليمن (الموقع الفلكي)',
    scope: 'yemen',
    layer: 'topography',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 8 – 11',
    lat: 15.5,
    lng: 47.5,
    ...(() => {
      const p = projectYemen(15.5, 47.5);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: 34,
    summary: 'تمتد الجمهورية اليمنية بين دائرتي عرض 12°–19° شمالاً وخطي طول 41°–55° شرقاً بمساحة 555 ألف كم² (دون الربع الخالي) وساحل يتجاوز 2200 كم.',
    facts: [
      'تحدها السعودية شمالاً وعمان شرقاً والبحر الأحمر غرباً وخليج عدن والبحر العربي جنوباً.',
      'تتبعها أكثر من 154 جزيرة في البحر الأحمر والبحر العربي.'
    ],
    conceptIds: ['concept-astro-loc', 'concept-geo-loc']
  },
  {
    id: 'loc-bab-el-mandeb',
    name: 'مضيق باب المندب وجزيرة ميون',
    shortLabel: 'باب المندب وميون',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 10 – 11، 63',
    lat: 12.68,
    lng: 43.42,
    ...(() => {
      const p = projectYemen(12.68, 43.42);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -62,
    labelDy: 26,
    summary: 'البوابة الجنوبية للبحر الأحمر والوطن العربي؛ يربط البحر الأحمر بخليج عدن والمحيط الهندي بعرض لا يزيد عن 30 كم، وتقسمه جزيرة ميون (بريم) إلى ممرين.',
    facts: [
      'أهمية عسكرية استراتيجية: برز دوره في حرب أكتوبر 1973م بالتعاون مع مصر.',
      'أهمية اقتصادية: يمر عبره شريان التجارة البحرية العالمية بين الشرق والغرب.'
    ],
    conceptIds: ['concept-bab-mandeb', 'concept-arab-world']
  },
  {
    id: 'loc-socotra-island',
    name: 'أرخبيل ومحمية سقطرى الطبيعية',
    shortLabel: 'أرخبيل سقطرى',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 10، 30، 54',
    lat: 12.5,
    lng: 53.9,
    ...(() => {
      const p = projectYemen(12.5, 53.9);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -38,
    labelDy: -24,
    elevationMeters: 1520,
    summary: 'أكبر الجزر والمحميات اليمنية (6 جزر، مساحة 3,700 كم²)، أُعلنت محافظة مستقلة نهاية عام 2013م.',
    facts: [
      'تضم أكثر من 250 نوعاً نباتياً نادراً مثل شجرة دم الأخوين والعندم والمر واللبان.',
      'يصل أعلى ارتفاع فيها إلى 1520م، وتضم وادي أثرور وقط الزباد، وأمطارها 150–500 ملم.'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-kamaran-hanish',
    name: 'جزر البحر الأحمر (كمران وحنيش وزقر)',
    shortLabel: 'كمران وحنيش وزقر',
    scope: 'yemen',
    layer: 'topography',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 10',
    lat: 14.3,
    lng: 42.65,
    ...(() => {
      const p = projectYemen(14.3, 42.65);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -58,
    labelDy: 18,
    summary: 'مجموعة جزر يمنية في البحر الأحمر أبرزها: كمران، حنيش الكبرى والصغرى، زقر، الفشت، بكلان، الطير، والزبير.',
    facts: [
      'جزيرة كمران من أكبر الجزر اليمنية في البحر الأحمر.',
      'تقع جزر حنيش وزقر في الممر الملاحي للبحر الأحمر شمال باب المندب.'
    ],
    conceptIds: ['concept-geo-loc']
  },
  {
    id: 'loc-tihamah',
    name: 'السهل الساحلي الغربي (تهامة)',
    shortLabel: 'سهل تهامة',
    scope: 'yemen',
    layer: 'climate',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 14، 18 – 20',
    lat: 14.6,
    lng: 43.1,
    ...(() => {
      const p = projectYemen(14.6, 43.1);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -86,
    labelDy: -10,
    elevationMeters: 100,
    summary: 'يمتد من الشيخ سعيد جنوباً إلى الحدود السعودية شمالاً باتساع 20–60 كم وأقصى ارتفاع 200م، ومناخه شبه مداري حار رطب.',
    facts: [
      'أهم أوديته: مور، سردد، سهام، رماع، زبيد، رسيان، موزع.',
      'ينمو فيه المانجروف والشورى والنخيل والأثل والسنط والدوم والموز والحمضيات.'
    ],
    conceptIds: ['concept-topography']
  },
  {
    id: 'loc-nabi-shuayb',
    name: 'جبل النبي شعيب (أعلى قمة باليمن وشبه الجزيرة)',
    shortLabel: 'جبل النبي شعيب (3670م)',
    scope: 'yemen',
    layer: 'topography',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 14 – 17، 68',
    lat: 15.28,
    lng: 43.97,
    ...(() => {
      const p = projectYemen(15.28, 43.97);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -42,
    labelDy: -74,
    elevationMeters: 3670,
    summary: 'أعلى قمة جبلية في الجمهورية اليمنية وشبه الجزيرة العربية بارتفاع 3,670 متراً ضمن النطاق الجبلي الأوسط غرب صنعاء.',
    facts: [
      'يُعد نموذجاً للمرتفعات الانكسارية والبركانية (الوحدة 3 ص 67).',
      'تنخفض فوقه الحرارة بمعدل 1°م لكل 150م ارتفاعاً فتصبح أجواؤه معتدلة صيفاً وباردة شتاءً.'
    ],
    conceptIds: ['concept-topography', 'concept-folded-fault-mountains']
  },
  {
    id: 'loc-jahran-plain',
    name: 'قاع جهران وجبل أسبيل (ذمار)',
    shortLabel: 'قاع جهران وأسبيل',
    scope: 'yemen',
    layer: 'topography',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 15، 19، 45',
    lat: 14.7,
    lng: 44.35,
    ...(() => {
      const p = projectYemen(14.7, 44.35);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 82,
    labelDy: -6,
    elevationMeters: 2400,
    summary: 'سهل مرتفع خصب يتخلل النطاق الجبلي الأوسط، وإلى الشرق من ذمار يقع جبل أسبيل بارتفاع 3,190 متراً.',
    facts: [
      'القيعان البارزة: قاع صعدة، قاع البون، وقاع جهران.',
      'من أقاليم المرتفعات ذات المدى الحراري الكبير وتعد منطقة زراعية خصبة.'
    ],
    conceptIds: ['concept-qiaan']
  },
  {
    id: 'loc-hadramout-plateau',
    name: 'هضبة ووادي حضرموت (المسيلة)',
    shortLabel: 'هضبة ووادي حضرموت',
    scope: 'yemen',
    layer: 'water',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 15، 26',
    lat: 15.9,
    lng: 48.8,
    ...(() => {
      const p = projectYemen(15.9, 48.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 72,
    labelDy: -16,
    elevationMeters: 750,
    summary: 'تتكون هضبة حضرموت من ثنيتين محدبتين (الهضبة الشمالية والجنوبية) يفصل بينهما وادي حضرموت الذي يتجه شرقاً وجنوباً نحو البحر العربي باسم وادي المسيلة.',
    facts: [
      'تمثل الإقليم المناخي الداخلي والشرقي الجاف القاري.',
      'تشتهر باللبان والنخيل وتنتهي أطرافها الشمالية عند الربع الخالي.'
    ],
    conceptIds: ['concept-topography', 'concept-surface-water']
  },
  {
    id: 'loc-marib-dam',
    name: 'سد مأرب ووادي أذنة',
    shortLabel: 'سد مأرب ووادي أذنة',
    scope: 'yemen',
    layer: 'water',
    unitId: 'unit-1',
    lessonId: 'u1-l4',
    pageRef: 'ص 24 – 26، 54',
    lat: 15.4,
    lng: 45.25,
    ...(() => {
      const p = projectYemen(15.4, 45.25);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 38,
    labelDy: -54,
    elevationMeters: 1150,
    summary: 'من أهم منشآت المياه السطحية والمعالم التاريخية في اليمن، يجمع مياه وادي أذنة الذي يتجه شرقاً نحو هضبة الجدعان ومأرب.',
    facts: [
      'مذكور مع سد كمران وسد مختان ضمن موارد المياه السطحية (ص 24–25).',
      'معلم أثري وسياحي رئيس ومرتبط بحضارة سبأ.'
    ],
    conceptIds: ['concept-surface-water']
  },
  {
    id: 'loc-jabal-bura',
    name: 'محمية جبل برع الطبيعية (الحديدة)',
    shortLabel: 'محمية جبل برع',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 31',
    lat: 14.88,
    lng: 43.47,
    ...(() => {
      const p = projectYemen(14.88, 43.47);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -12,
    labelDy: -58,
    elevationMeters: 1200,
    summary: 'محمية جبلية تقع على بُعد 50 كم شمال شرق مدينة الحديدة بمساحة 48 كم²، وتتميز بغاباتها المدارية الكثيفة.',
    facts: [
      'إحدى المحميات الطبيعية الست المقررة في اليمن.',
      'تضم تنوعاً نباتياً وحيوانياً فريداً في المنحدرات الغربية.'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-hawf-reserve',
    name: 'محمية حوف الطبيعية (المهرة)',
    shortLabel: 'محمية حوف',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 31',
    lat: 16.64,
    lng: 53.05,
    ...(() => {
      const p = projectYemen(16.64, 53.05);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 38,
    labelDy: 24,
    elevationMeters: 1500,
    summary: 'تقع في محافظة المهرة بطول 60 كم ومساحة 569 كم² وارتفاع يصل إلى 1500م، وتتميز بغابات موسمية ضبابية مطيرة.',
    facts: [
      'تُعد من أغنى المحميات الطبيعية بالتنوع النباتي في جنوب شرق اليمن.',
      'تنتشر فيها أشجار اللبان والنباتات الساحلية والجبلية.'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-jabal-iraf',
    name: 'محمية جبل إراف الطبيعية (لحج)',
    shortLabel: 'محمية جبل إراف',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 31',
    lat: 13.12,
    lng: 44.25,
    ...(() => {
      const p = projectYemen(13.12, 44.25);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 88,
    labelDy: 14,
    summary: 'تقع في مديرية المقاطرة بمحافظة لحج بمساحة 121 كم²، وتحتوي على خليط نباتي أفريقي وعربي ومتوسطي يضم نحو 45 صنفاً نباتياً.',
    facts: [
      'تجمع عناصر نباتية من ثلاث مناطق حيوية متجاورة.',
      'أحد المواقع المقررة ضمن خريطة المحميات الست (ص 29).'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-utma-reserve',
    name: 'محمية عتمة الطبيعية (ذمار)',
    shortLabel: 'محمية عتمة',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 32',
    lat: 14.48,
    lng: 43.95,
    ...(() => {
      const p = projectYemen(14.48, 43.95);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 78,
    labelDy: 22,
    elevationMeters: 2400,
    summary: 'تقع غرب محافظة ذمار بمساحة 450 كم² وارتفاع بين 650–2400م وأمطار 750–800 ملم، وتواجه تهديدات شق الطرقات والبناء العشوائي والمبيدات.',
    facts: [
      'تغطي مدرجات خضراء وينابيع دائمة في المنحدرات الوسطى.',
      'يبرز الكتاب خطورة التوسع العمراني والمبيدات على توازنها البيئي.'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-sharma-reserve',
    name: 'محمية شرمة الساحلية (حضرموت)',
    shortLabel: 'محمية شرمة',
    scope: 'yemen',
    layer: 'reserves',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 32',
    lat: 14.82,
    lng: 50.0,
    ...(() => {
      const p = projectYemen(14.82, 50.0);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 66,
    labelDy: 18,
    summary: 'تقع شرق المكلا بمحافظة حضرموت بمساحة 62 كم²، وتشتهر بتعشيش السلاحف الخضراء النادرة والمواقع الأثرية الساحلية.',
    facts: [
      'موطن بحري ساحلي حيوي لحماية السلاحف البحرية المهددة.',
      'تجمع بين الحماية البيئية والقيمة الأثرية والسياحية.'
    ],
    conceptIds: ['concept-natural-reserve']
  },
  {
    id: 'loc-taiz-city',
    name: 'محافظة تعز (أعلى نسبة سكانية ومعالم)',
    shortLabel: 'تعز (12% سكان)',
    scope: 'yemen',
    layer: 'population',
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    pageRef: 'ص 38، 48، 54',
    lat: 13.58,
    lng: 44.02,
    ...(() => {
      const p = projectYemen(13.58, 44.02);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 82,
    labelDy: -2,
    elevationMeters: 1400,
    summary: 'تتصدر محافظات الجمهورية في النسبة السكانية بـ 12.0% من إجمالي السكان (جدول 1 ص 38)، وتضم قلعة القاهرة ومناجم النحاس في حيفان ومصنع أسمنت البرح.',
    facts: [
      'أعلى نسبة سكانية تليها الحديدة (11.0%) وإب (10.7%).',
      'معلم سياحي وتاريخي بارز وتضم خامات الرخام والجبس والنحاس.'
    ],
    conceptIds: ['concept-pop-density']
  },
  {
    id: 'loc-ibb-density',
    name: 'محافظة إب والوسط المرتفع الكثافة (>220 نسمة/كم²)',
    shortLabel: 'إب (كثافة عالية جداً)',
    scope: 'yemen',
    layer: 'population',
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    pageRef: 'ص 38 – 39',
    lat: 13.97,
    lng: 44.18,
    ...(() => {
      const p = projectYemen(13.97, 44.18);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -72,
    labelDy: -14,
    elevationMeters: 2050,
    summary: 'تمثل إب (10.7% من سكان اليمن) مع تعز وأمانة العاصمة والحديدة حزام الكثافة السكانية العالية جداً (>220 نسمة/كم²) لوفرة الأمطار والمدرجات الزراعية الخصبة.',
    facts: [
      'ثالث أعلى محافظة في النسبة السكانية (10.7% من سكان الجمهورية).',
      'نموذج لتأثير المناخ المعتدل والأمطار الغزيرة والزراعة في الجذب السكاني (ص 38–39).'
    ],
    conceptIds: ['concept-pop-density']
  },
  {
    id: 'loc-sanaa-city',
    name: 'أمانة العاصمة وصنعاء القديمة',
    shortLabel: 'صنعاء القديمة',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 38، 54، 109',
    lat: 15.35,
    lng: 44.2,
    ...(() => {
      const p = projectYemen(15.35, 44.2);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 18,
    labelDy: -102,
    elevationMeters: 2250,
    summary: 'العاصمة الإدارية للجمهورية اليمنية (9.3% من السكان)، وتشتهر بمدينة صنعاء القديمة ودار الحجر وتُعد من أبرز المعالم السياحية اليمنية والعربية.',
    facts: [
      'مطار دولي رئيس ومركز تجاري وخدمي وإداري.',
      'تحتضن منطقة نهم المجاورة خامات الزنك والرصاص والفضة غير المستغلة (ص 48).'
    ],
    conceptIds: ['concept-tourism-yemen', 'concept-arab-density']
  },
  {
    id: 'loc-al-mahrah',
    name: 'محافظة المهرة (أقل نسبة سكانية وميناء نشطون)',
    shortLabel: 'المهرة ونشطون',
    scope: 'yemen',
    layer: 'population',
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    pageRef: 'ص 38، 51',
    lat: 16.5,
    lng: 51.8,
    ...(() => {
      const p = projectYemen(16.5, 51.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -12,
    labelDy: -24,
    summary: 'أدنى محافظة في النسبة السكانية بـ 0.46% من سكان الجمهورية رغم مساحتها الواسعة، وتضم ميناء نشطون البحري ومحمية حوف.',
    facts: [
      'تربط اليمن شرقاً بسلطنة عمان.',
      'ميناء نشطون أحد الموانئ البحرية الستة الرئيسة المقررة (ص 51).'
    ],
    conceptIds: ['concept-pop-density']
  },
  {
    id: 'loc-hodeidah-port',
    name: 'ميناء الحديدة والصليف',
    shortLabel: 'ميناء الحديدة',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 38، 47 – 48، 51',
    lat: 14.8,
    lng: 42.95,
    ...(() => {
      const p = projectYemen(14.8, 42.95);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -78,
    labelDy: -40,
    summary: 'ثاني أكبر تجمع سكاني بالمحافظات (11.0%) وأهم ميناءين على البحر الأحمر، ويجاور الصليف مناجم الملح الصخري والجبس.',
    facts: [
      'الصليف ميناء لتصدير الملح الصخري والنفط (رأس عيسى).',
      'مركز صناعي ومينائي وبوابة السهل الساحلي الغربي.'
    ],
    conceptIds: ['concept-mining', 'concept-industry']
  },
  {
    id: 'loc-mokha-coffee',
    name: 'ميناء المخا (شهرة بن مخا التاريخية)',
    shortLabel: 'ميناء المخا',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 44، 51',
    lat: 13.32,
    lng: 43.25,
    ...(() => {
      const p = projectYemen(13.32, 43.25);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -72,
    labelDy: 8,
    summary: 'ميناء يمني تاريخي عريق على البحر الأحمر، ارتبط اسمه عالمياً بأجود أنواع البن اليمني («بن مخا»).',
    facts: [
      'يُصدر عبره البن اليمني المتنوع (المطري، الحرازي، اليافعي، الخولاني...).',
      'أحد الموانئ الستة الرئيسة في النقل المائي باليمن.'
    ],
    conceptIds: ['concept-agriculture']
  },
  {
    id: 'loc-marib-safer',
    name: 'حقل صافر للنفط والغاز (مأرب)',
    shortLabel: 'حقل صافر (مأرب)',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 47 – 49',
    lat: 15.58,
    lng: 45.8,
    ...(() => {
      const p = projectYemen(15.58, 45.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 80,
    labelDy: -10,
    summary: 'موقع حفر أول بئر نفطي تجاري في الجمهورية اليمنية عام 1984م، ومنطقة رئيسة لإنتاج النفط والغاز الطبيعي والملح الصخري.',
    facts: [
      'يُنتج النفط في مأرب وشبوة وحضرموت والجوف.',
      'يُنتج الغاز الطبيعي في مأرب وحضرموت ويُصدر مسالاً.'
    ],
    conceptIds: ['concept-mining']
  },
  {
    id: 'loc-aden-port',
    name: 'ميناء عدن ومعالمها (صيرة والصهاريج)',
    shortLabel: 'ميناء عدن',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 51، 54',
    lat: 12.78,
    lng: 45.02,
    ...(() => {
      const p = projectYemen(12.78, 45.02);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 12,
    labelDy: 34,
    summary: 'أحد أهم الموانئ الطبيعية الاستراتيجية على خليج عدن والبحر العربي، ومركز تجاري وصناعي وسياحي يضم صهاريج عدن وقلعة صيرة وساحل أبين.',
    facts: [
      'يرتبط بمطار عدن الدولي وشبكة النقل البري والبحري.',
      'يمثل ركيزة في التجارة الخارجية والنقل المائي اليمني.'
    ],
    conceptIds: ['concept-tourism-yemen', 'concept-trade-transport']
  },
  {
    id: 'loc-mukalla-port',
    name: 'ميناء المكلا (حضرموت)',
    shortLabel: 'ميناء المكلا',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 51 – 52',
    lat: 14.54,
    lng: 49.12,
    ...(() => {
      const p = projectYemen(14.54, 49.12);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: 26,
    summary: 'ميناء يمني رئيس على البحر العربي يخدم تصدير الثروات السمكية والتجارة ومناطق حضرموت.',
    facts: [
      'يقع غرب محمية شرمة الطبيعية وميناء الضبة النفطي.',
      'يرتبط بمطار الريان الدولي.'
    ],
    conceptIds: ['concept-trade-transport']
  },
  {
    id: 'loc-salif-port',
    name: 'مناجم الملح الصخري وميناء الصليف',
    shortLabel: 'ميناء الصليف',
    scope: 'yemen',
    layer: 'economy',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 47 – 48، 51',
    lat: 15.3,
    lng: 42.67,
    ...(() => {
      const p = projectYemen(15.3, 42.67);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -58,
    labelDy: -52,
    summary: 'موقع رئيس لاستخراج الملح الصخري والجبس، وأحد الموانئ البحرية الستة في البحر الأحمر.',
    facts: [
      'يُستخرج الملح الصخري أيضاً في صافر وشبوة.',
      'ميناء عميق المياه مهم للشحن الصناعي والغذائي.'
    ],
    conceptIds: ['concept-mining']
  },
  {
    id: 'loc-shibam-hadramout',
    name: 'مدينة شبام حضرموت التاريخية وقصر سيئون',
    shortLabel: 'شبام حضرموت',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 15.92,
    lng: 48.62,
    ...(() => {
      const p = projectYemen(15.92, 48.62);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -36,
    labelDy: -38,
    summary: 'من أبرز المعالم الأثرية والسياحية في اليمن، تشتهر بمبانيها الطينية الشاهقة داخل وادي حضرموت وقصر سيئون المجاور.',
    facts: [
      'مذكورة في درس السياحة ضمن المعالم الأثرية البالغ عددها أكثر من 2288 معلماً.',
      'نموذج فريد للعمارة الطينية المتكيفة مع المناخ الحار الجاف.'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-aden-coast-landmarks',
    name: 'معالم عدن الساحلية والتاريخية (ساحل الغدير، ساحل أبين، الصهاريج، قلعة صيرة، مسجد العيدروس)',
    shortLabel: 'ساحل الغدير وأبين والصهاريج',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 12.84,
    lng: 44.78,
    ...(() => {
      const p = projectYemen(12.84, 44.78);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -78,
    labelDy: 24,
    summary: 'تجمع محافظة عدن بين المعالم التاريخية العريقة (صهاريج عدن، قلعة صيرة، مسجد العيدروس) والشواطئ السياحية البارزة مثل ساحل الغدير في البريقة وساحل أبين في خور مكسر.',
    facts: [
      'ساحل الغدير وساحل أبين من أبرز الشواطئ السياحية المقررة في درس السياحة باليمن (ص 54).',
      'تُعد صهاريج عدن وقلعة صيرة ومسجد العيدروس من أبرز المعالم الأثرية والتاريخية في عدن (ص 54–55).'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-thula-dar-hajar',
    name: 'دار الحجر ومدينة ثلا التاريخية (صنعاء وعمران)',
    shortLabel: 'دار الحجر وثلا',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55، 108',
    lat: 15.56,
    lng: 43.9,
    ...(() => {
      const p = projectYemen(15.56, 43.9);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -84,
    labelDy: -8,
    elevationMeters: 2350,
    summary: 'معلمان معماريان وتاريخيان بارزان في المرتفعات الغربية: دار الحجر في وادي ظهر شمال غرب صنعاء ومدينة ثلا الأثرية المسوّرة بمحافظة عمران.',
    facts: [
      'دار الحجر معلم سياحي وتاريخي شهير ورد في وحدتي اليمن والوطن العربي (ص 54 و108).',
      'مدينة ثلا الأثرية من المدن التاريخية الحجرية المحصنة شمال غرب صنعاء (ص 54).'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-shahhara-bridge',
    name: 'جسر شهارة التاريخي (عمران)',
    shortLabel: 'جسر شهارة',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 16.18,
    lng: 43.7,
    ...(() => {
      const p = projectYemen(16.18, 43.7);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -55,
    labelDy: -34,
    elevationMeters: 2600,
    summary: 'جسر حجري معلق فريد فوق أخدود جبلي عميق يربط بين جبلين في مديرية شهارة، ويُعد من روائع العمارة الهندسية اليمنية.',
    facts: [
      'مذكور صراحة ضمن المعالم التاريخية والسياحية في الجمهورية اليمنية (ص 54).',
      'يمثل نموذجاً للسياحة الجبلية والأثرية والقفز والتسلق الجبلي.'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-baraqish-ancient',
    name: 'مدينة براقش الأثرية (الجوف)',
    shortLabel: 'مدينة براقش',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 15.98,
    lng: 44.8,
    ...(() => {
      const p = projectYemen(15.98, 44.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 66,
    labelDy: -28,
    elevationMeters: 1120,
    summary: 'مدينة أثرية تاريخية عريقة بمحافظة الجوف شمال شرق صنعاء على طريق البخور القديم، اشتهرت بسورها الحجري وأبراجها ومعابدها.',
    facts: [
      'وردت مع سد مأرب ضمن أبرز المدن والمواقع الأثرية القديمة في اليمن (ص 54).',
      'ترتبط بتراث الممالك اليمنية القديمة (معين وسبأ).'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-taiz-cairo-castle',
    name: 'قلعة القاهرة التاريخية (تعز)',
    shortLabel: 'قلعة القاهرة (تعز)',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 13.56,
    lng: 44.01,
    ...(() => {
      const p = projectYemen(13.56, 44.01);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 74,
    labelDy: 24,
    elevationMeters: 1500,
    summary: 'قلعة تاريخية حصينة تتربع على السفح الشمالي لجبل صبر وتطل على مدينة تعز، وتُعد من أبرز المعالم الأثرية في اليمن.',
    facts: [
      'مقررة بالاسم ضمن المعالم التاريخية والسياحية في درس السياحة (ص 54).',
      'تطل على المدينة في موقع استراتيجي بين المرتفعات الجنوبية.'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-damt-hammam',
    name: 'حمام دمت وحمام علي (السياحة العلاجية)',
    shortLabel: 'حمام دمت وعلي',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55، 108',
    lat: 14.1,
    lng: 44.68,
    ...(() => {
      const p = projectYemen(14.1, 44.68);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 82,
    labelDy: -8,
    elevationMeters: 1750,
    summary: 'أشهر مواقع السياحة العلاجية في اليمن بفضل ينابيع المياه المعدنية والكبريتية الحارة الطبيعية في دمت (الضالع) وحمام علي (ذمار).',
    facts: [
      'تمثل الحمامات الطبيعية العلاجية أحد الأنشطة السياحية الرئيسة المقررة في ص 55 وص 108.',
      'تستقطب السياحة الداخلية والخارجية طلباً للاستشفاء الطبيعي.'
    ],
    conceptIds: ['concept-tourism-yemen', 'concept-tourism-types']
  },
  {
    id: 'loc-khokha-beach',
    name: 'ساحل الخوخة السياحي (الحديدة)',
    shortLabel: 'ساحل الخوخة',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    lat: 13.81,
    lng: 43.25,
    ...(() => {
      const p = projectYemen(13.81, 43.25);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -72,
    labelDy: -10,
    summary: 'شاطئ ومنتجع ساحلي سياحي على البحر الأحمر في محافظة الحديدة، يشتهر بصفاء مياهه وشواطئه الرملية وبساتين النخيل.',
    facts: [
      'مذكور بالاسم في درس السياحة ضمن المعالم الساحلية والسياحية في اليمن (ص 54).',
      'يمثل السياحة البحرية والترفيهية على الساحل الغربي لليمن.'
    ],
    conceptIds: ['concept-tourism-yemen']
  },
  {
    id: 'loc-seiyun-ghail',
    name: 'قصر سيئون وغيل باوزير (حضرموت)',
    shortLabel: 'قصر سيئون وغيل باوزير',
    scope: 'yemen',
    layer: 'tourism',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 48، 54 – 55',
    lat: 15.55,
    lng: 49.05,
    ...(() => {
      const p = projectYemen(15.55, 49.05);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 74,
    labelDy: 18,
    summary: 'معلمان بارزان في حضرموت: قصر سيئون التاريخي في قلب وادي حضرموت، ومدينة وعيون غيل باوزير التاريخية والساحلية قرب المكلا.',
    facts: [
      'قصر سيئون وغيل باوزير من المعالم المقررة في درس السياحة (ص 54).',
      'كما ذُكرت غيل باوزير في مناطق تواجد الحجر الجيري باليمن (ص 48).'
    ],
    conceptIds: ['concept-tourism-yemen']
  },

  // ================= ARAB WORLD LOCATIONS =================
  {
    id: 'loc-arab-world-center',
    name: 'الموقع الفلكي والجغرافي للوطن العربي',
    shortLabel: 'موقع الوطن العربي (13.3 م.كم²)',
    scope: 'arab-world',
    layer: 'topography',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 60 – 64',
    lat: 24.5,
    lng: 23.0,
    ...(() => {
      const p = projectArabWorld(24.5, 23.0);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: -26,
    summary: 'يمتد الوطن العربي بين خطي طول 60° شرقاً و17° غرباً ودائرتي عرض 2° جنوباً و37°30′ شمالاً (باستثناء جزر القمر 11°–13° جنوباً)، بمساحة 13.3 مليون كم² تضم 22 دولة.',
    facts: [
      'الحدود الجغرافية: شمالاً البحر المتوسط وجبال طوروس، جنوباً المحيط الهندي والبحر العربي والصحراء الكبرى، شرقاً جبال زاجروس والخليج العربي وخليج عُمان، غرباً المحيط الأطلسي.',
      'التوزيع القاري: 71% من المساحة في الجناح الأفريقي (10 دول) و29% في الجناح الآسيوي (12 دولة منها اليمن).'
    ],
    conceptIds: ['concept-arab-world']
  },
  {
    id: 'loc-arab-mandeb',
    name: 'مضيق باب المندب (في الإطار العربي)',
    shortLabel: 'باب المندب',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 63، 105',
    lat: 12.68,
    lng: 43.42,
    ...(() => {
      const p = projectArabWorld(12.68, 43.42);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -55,
    labelDy: 18,
    summary: 'يربط البحر الأحمر بخليج عدن والمحيط الهندي، وتشرف عليه اليمن وجيبوتي، وهو البوابة الجنوبية للتجارة العربية.',
    facts: [
      'أحد الممرات البحرية الأربعة الاستراتيجية للوطن العربي.',
      'يصل الملاحة الآسيوية بالموانئ العربية والأوروبية عبر قناة السويس.'
    ],
    conceptIds: ['concept-arab-world', 'concept-bab-mandeb']
  },
  {
    id: 'loc-hormuz',
    name: 'مضيق هرمز',
    shortLabel: 'مضيق هرمز',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 63، 105',
    lat: 26.56,
    lng: 56.25,
    ...(() => {
      const p = projectArabWorld(26.56, 56.25);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 12,
    labelDy: -22,
    summary: 'ممر بحري حيوي يربط الخليج العربي بخليج عمان وبحر العرب، وتطل عليه سلطنة عُمان.',
    facts: [
      'ممر رئيس لتصدير النفط والغاز العربي إلى الأسواق العالمية.',
      'أحد المضائق الأربعة الرئيسة في خريطة الوطن العربي.'
    ],
    conceptIds: ['concept-arab-world']
  },
  {
    id: 'loc-suez-canal',
    name: 'قناة السويس',
    shortLabel: 'قناة السويس',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 63، 105',
    lat: 30.58,
    lng: 32.27,
    ...(() => {
      const p = projectArabWorld(30.58, 32.27);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 6,
    labelDy: -44,
    summary: 'ممر مائي اصطناعي في مصر يصل البحر الأحمر بالبحر المتوسط ويختصر المسافة بين آسيا وأوروبا.',
    facts: [
      'تمثل مع مضيق باب المندب شريان الملاحة بين المحيط الهندي والبحر المتوسط.',
      'تقع ضمن نطاق النقل البحري العربي الرئيس.'
    ],
    conceptIds: ['concept-arab-world', 'concept-trade-transport']
  },
  {
    id: 'loc-gibraltar',
    name: 'مضيق جبل طارق',
    shortLabel: 'مضيق جبل طارق',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 63، 105',
    lat: 35.97,
    lng: -5.5,
    ...(() => {
      const p = projectArabWorld(35.97, -5.5);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: -22,
    summary: 'البوابة الغربية للوطن العربي، يربط البحر المتوسط بالمحيط الأطلسي وتطل عليه المملكة المغربية.',
    facts: [
      'يفصل شمال أفريقيا عن شبه جزيرة إيبيريا في أوروبا.',
      'يربط الموانئ المتوسطية بطرق المحيط الأطلسي.'
    ],
    conceptIds: ['concept-arab-world']
  },
  {
    id: 'loc-comoros',
    name: 'جزر القمر (خارج النطاق الفلكي المتصل)',
    shortLabel: 'جزر القمر',
    scope: 'arab-world',
    layer: 'climate',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 61، 75، 88',
    lat: -11.7,
    lng: 43.3,
    ...(() => {
      const p = projectArabWorld(-11.7, 43.3, true);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: 24,
    summary: 'دولة عربية جزرية تقع في المحيط الهندي بين خطي طول 43°–46° شرقاً ودائرتي عرض 11°–13° جنوباً، وتقع ضمن النطاق الاستوائي.',
    facts: [
      'الدولة العربية الوحيدة الواقعة كلياً جنوب خط الاستواء في النصف الجنوبي.',
      'تتمتع بمناخ وغابات استوائية (ص 75).'
    ],
    conceptIds: ['concept-arab-world', 'concept-arab-climate-regions']
  },
  {
    id: 'loc-atlas-mountains',
    name: 'جبال أطلس وقمة جبل طوبقال (4165م)',
    shortLabel: 'جبال أطلس وطوبقال',
    scope: 'arab-world',
    layer: 'topography',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    pageRef: 'ص 67 – 68، 74',
    lat: 31.06,
    lng: -7.91,
    ...(() => {
      const p = projectArabWorld(31.06, -7.91);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -35,
    labelDy: 24,
    elevationMeters: 4165,
    summary: 'سلسلة جبال التوائية تمتد في المغرب والجزائر وتونس، وتضم أعلى قمة في الوطن العربي وهي قمة جبل طوبقال (4,165م) في المغرب.',
    facts: [
      'تصد الرياح الرطبة الآتية من المتوسط والأطلسي وتسهم في إقليم مناخ البحر المتوسط.',
      'تنمو على سفوحها غابات الأرز والصنوبر والبلوط الفليني.'
    ],
    conceptIds: ['concept-folded-fault-mountains', 'concept-arab-climate-regions']
  },
  {
    id: 'loc-nile-basin',
    name: 'حوض نهر النيل والدلتا (سهول فيضية وكثافة عالية)',
    shortLabel: 'حوض النيل والدلتا',
    scope: 'arab-world',
    layer: 'water',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    pageRef: 'ص 69، 80، 90',
    lat: 29.5,
    lng: 31.2,
    ...(() => {
      const p = projectArabWorld(29.5, 31.2);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -72,
    labelDy: 16,
    summary: 'أطول أنهار الوطن العربي وأحد أكبر السهول الفيضية الخصبة؛ يضم مصر (~98.4 مليون نسمة) والسودان، ويمثل أعلى منطقة كثافة سكانية عربية.',
    facts: [
      'مرتبط بالزراعة المروية الدائمة في مصر والسودان.',
      'تقع عند أسوان على مجراه بحيرة ناصر الصناعية (ص 81).'
    ],
    conceptIds: ['concept-alluvial-plains', 'concept-water-security', 'concept-arab-density']
  },
  {
    id: 'loc-lake-nasser',
    name: 'بحيرة ناصر (مصر)',
    shortLabel: 'بحيرة ناصر',
    scope: 'arab-world',
    layer: 'water',
    unitId: 'unit-3',
    lessonId: 'u3-l4',
    pageRef: 'ص 81',
    lat: 22.8,
    lng: 32.5,
    ...(() => {
      const p = projectArabWorld(22.8, 32.5);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -55,
    labelDy: 10,
    summary: 'بحيرة مائية كبرى في جنوب مصر تكونت خلف السد العالي وتُعد مخزوناً مائياً وسمكياً مهماً.',
    facts: [
      'مثال رئيس للبحيرات في درس الموارد المائية العربية (ص 81).',
      'تدعم الأمن المائي والزراعة المروية في وادي النيل.'
    ],
    conceptIds: ['concept-water-security']
  },
  {
    id: 'loc-tigris-euphrates',
    name: 'سهول نهري دجلة والفرات (العراق وسوريا)',
    shortLabel: 'دجلة والفرات',
    scope: 'arab-world',
    layer: 'water',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    pageRef: 'ص 69، 80، 90',
    lat: 33.3,
    lng: 44.4,
    ...(() => {
      const p = projectArabWorld(33.3, 44.4);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 55,
    labelDy: -24,
    summary: 'من أهم السهول الفيضية والأنهار الكبرى في الجناح الآسيوي للوطن العربي، وتتميز بتربتها الخصبة وكثافتها السكانية العالية.',
    facts: [
      'منطقة حضارية وزراعية قديمة (بلاد الرافدين).',
      'تواجه تحديات تقاسم المياه عبر الحدود (الأمن المائي).'
    ],
    conceptIds: ['concept-alluvial-plains', 'concept-water-security']
  },
  {
    id: 'loc-arabian-gulf-oil',
    name: 'حوض الخليج العربي (النفط والغاز وتحلية المياه)',
    shortLabel: 'حوض الخليج العربي',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    pageRef: 'ص 81، 101',
    lat: 26.2,
    lng: 50.1,
    ...(() => {
      const p = projectArabWorld(26.2, 50.1);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 0,
    labelDy: 24,
    summary: 'أكبر منطقة تركز لإنتاج وتصدير النفط والغاز الطبيعي في الوطن العربي (>26% من النفط العالمي) ومحطات تحلية مياه البحر.',
    facts: [
      'تعتمد دول الخليج بدرجة رئيسة على تحلية مياه البحر لتوفير المياه العذبة (ص 81–82).',
      'تتركز فيها الصناعات البتروكيماوية.'
    ],
    conceptIds: ['concept-industry-factors']
  },
  {
    id: 'loc-morocco-fisheries',
    name: 'المغرب وموريتانيا (الصيد البحري والفوسفات والحديد)',
    shortLabel: 'المغرب وموريتانيا (الأسماك)',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-4',
    lessonId: 'u4-l2',
    pageRef: 'ص 96، 100',
    lat: 31.8,
    lng: -7.5,
    ...(() => {
      const p = projectArabWorld(31.8, -7.5);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -72,
    labelDy: -16,
    summary: 'تتصدر المملكة المغربية الدول العربية في إنتاج الأسماك (مع مصر وموريتانيا واليمن وعُمان) وفي احتياطي وإنتاج الفوسفات، كما تبرز موريتانيا في الحديد والأسماك.',
    facts: [
      'يبلغ إنتاج الوطن العربي من الأسماك 3,041.7 ألف طن (2011م).',
      'إطلال طويل على المحيط الأطلسي والبحر المتوسط.'
    ],
    conceptIds: ['concept-food-security']
  },
  {
    id: 'loc-morocco-phosphate',
    name: 'مناجم الفوسفات العربية (المغرب، تونس، الأردن)',
    shortLabel: 'مناجم الفوسفات',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    pageRef: 'ص 100',
    lat: 32.8,
    lng: -6.9,
    ...(() => {
      const p = projectArabWorld(32.8, -6.9);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 74,
    labelDy: 8,
    summary: 'يمتلك الوطن العربي رصيداً استراتيجياً من خام الفوسفات الذي يدخل في صناعة الأسمدة الزراعية والصناعات الكيميائية.',
    facts: [
      'يربط استخراج الفوسفات بين قطاع التعدين ودعم الأمن الغذائي الزراعي.',
      'تشتهر به المغرب وتونس والأردن.'
    ],
    conceptIds: ['concept-industry-factors']
  },
  {
    id: 'loc-jerusalem',
    name: 'القدس الشريف (فلسطين)',
    shortLabel: 'القدس الشريف',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 62، 108 – 109',
    lat: 31.77,
    lng: 35.23,
    ...(() => {
      const p = projectArabWorld(31.77, 35.23);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 66,
    labelDy: -18,
    summary: 'من أعرق المدن الدينية والتاريخية في الوطن العربي والعالم؛ تجمع القيمة الحضارية والدينية والسياحة الثقافية.',
    facts: [
      'وردت صورتها في ص 109 إلى جانب صنعاء القديمة في درس السياحة بالوطن العربي.',
      'تمثل البعد الحضاري والروحي لموقع الوطن العربي.'
    ],
    conceptIds: ['concept-tourism-types']
  },
  {
    id: 'loc-petra',
    name: 'مدينة البتراء الأثرية (الأردن)',
    shortLabel: 'مدينة البتراء',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 107 – 108',
    lat: 30.33,
    lng: 35.44,
    ...(() => {
      const p = projectArabWorld(30.33, 35.44);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 68,
    labelDy: 16,
    summary: 'معلم أثري عربي بارز في الأردن يمثل السياحة الثقافية والأثرية في الوطن العربي.',
    facts: [
      'نحتت في الصخور الوردية وتستقطب السياحة الثقافية والاستكشافية.',
      'مذكورة بالصورة ضمن معالم السياحة العربية في ص 107.'
    ],
    conceptIds: ['concept-tourism-types']
  },
  {
    id: 'loc-giza-pyramids',
    name: 'الأهرامات وأبو الهول (مصر)',
    shortLabel: 'الأهرامات',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 107 – 108',
    lat: 29.97,
    lng: 31.13,
    ...(() => {
      const p = projectArabWorld(29.97, 31.13);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -68,
    labelDy: -18,
    summary: 'أشهر المعالم السياحية والتاريخية في مصر والوطن العربي، وتجسد عمق الحضارة المصرية القديمة.',
    facts: [
      'واردة ضمن صور المعالم السياحية العربية في ص 107.',
      'رافد مهم للسياحة الثقافية والعلمية.'
    ],
    conceptIds: ['concept-tourism-types']
  },
  {
    id: 'loc-levant-tourism',
    name: 'معالم سوريا ولبنان (تدمر، قلعة حلب، بعلبك، صيدا)',
    shortLabel: 'معالم سوريا ولبنان',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 79، 108',
    lat: 34.4,
    lng: 36.8,
    ...(() => {
      const p = projectArabWorld(34.4, 36.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 58,
    labelDy: -22,
    summary: 'تحتضن سوريا (تدمر، قلعة حلب، الجامع الأموي) ولبنان (بعلبك، صيدا، جبيل، مغارة جعيتا) معالم أثرية عريقة وأنهاراً تنبع من داخل الوطن العربي كالعاصي والليطاني.',
    facts: [
      'تمييز وزاري مهم: تدمر وقلعة حلب في سوريا، وبعلبك وصيدا في لبنان، والبتراء في الأردن (ص 108).',
      'يمتد على سواحلها إقليم البحر المتوسط الممطر شتاءً وتنمو فيه غابات الأرز والصنوبر.'
    ],
    conceptIds: ['concept-tourism-types', 'concept-arab-climate-regions']
  },
  {
    id: 'loc-fez-marrakech',
    name: 'فاس ومراكش التاريخيتان (المغرب)',
    shortLabel: 'فاس ومراكش',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 108 – 109',
    lat: 34.03,
    lng: -5.0,
    ...(() => {
      const p = projectArabWorld(34.03, -5.0);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -50,
    labelDy: 24,
    summary: 'حاضرتان تاريخيتان بارزتان في المملكة المغربية، تشتهران بالعمارة الإسلامية والأندلسية والأسواق التاريخية والجامعات العريقة.',
    facts: [
      'من أكثر المعالم المغاربية وروداً في أسئلة المطابقة الوزارية (س29 ص 108).',
      'تمثلان السياحة الثقافية والتاريخية في الجناح الأفريقي للوطن العربي.'
    ],
    conceptIds: ['concept-tourism-types']
  },
  {
    id: 'loc-qishlah-hail',
    name: 'قلعة القشلة الأثرية (السعودية)',
    shortLabel: 'قلعة القشلة',
    scope: 'arab-world',
    layer: 'tourism',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 108 – 109',
    lat: 27.52,
    lng: 41.7,
    ...(() => {
      const p = projectArabWorld(27.52, 41.7);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 52,
    labelDy: 14,
    summary: 'قلعة طينية تاريخية بارزة في حائل بالمملكة العربية السعودية، وردت صورتها ضمن نماذج المعالم السياحية العربية في درس السياحة.',
    facts: [
      'نموذج للعمارة التراثية والسياحة الثقافية في شبه الجزيرة العربية (ص 108–109).',
      'من المعالم المقررة التي يميز بها الطالب بين قلاع اليمن والسعودية والشام.'
    ],
    conceptIds: ['concept-tourism-types']
  },
  {
    id: 'loc-sudan-savanna',
    name: 'السودان وجبل مرة والسافانا والثروة الحيوانية',
    shortLabel: 'السودان والسافانا',
    scope: 'arab-world',
    layer: 'climate',
    unitId: 'unit-3',
    lessonId: 'u3-l3',
    pageRef: 'ص 68، 74، 95',
    lat: 13.8,
    lng: 29.8,
    ...(() => {
      const p = projectArabWorld(13.8, 29.8);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: -60,
    labelDy: 16,
    elevationMeters: 3042,
    summary: 'يمثل وسط السودان وجنوبه نطاق الإقليم المداري الممطر صيفاً وحشائش السافانا وأشجار الصمغ العربي، ويضم جبل مرة البركاني وتتصدر السودان (مع الصومال) الثروة الحيوانية العربية.',
    facts: [
      'جبل مرة في غرب السودان من أمثلة الجبال البركانية في الوطن العربي (ص 68).',
      'تتصدر السودان والصومال تربية الماشية في المراعي الطبيعية العربية البالغة 256 مليون هكتار (ص 95).'
    ],
    conceptIds: ['concept-arab-climate-regions', 'concept-folded-fault-mountains']
  },
  {
    id: 'loc-mauritania-iron',
    name: 'موريتانيا (خام الحديد والثروة السمكية)',
    shortLabel: 'موريتانيا (الحديد والأسماك)',
    scope: 'arab-world',
    layer: 'economy',
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    pageRef: 'ص 96، 100',
    lat: 20.5,
    lng: -11.5,
    ...(() => {
      const p = projectArabWorld(20.5, -11.5);
      return { svgX: p.x, svgY: p.y };
    })(),
    labelDx: 68,
    labelDy: 10,
    summary: 'تتصدر موريتانيا الدول العربية في إنتاج خام الحديد (11,500 ألف طن من إجمالي عربي يبلغ 19,895 ألف طن)، كما تأتي ضمن الدول الخمس الأعلى في صيد الأسماك.',
    facts: [
      'الأولى عربياً في خام الحديد وفق جدول المعادن (ص 100).',
      'ساحل أطلسي غني بالأسماك ضمن المراتب الخمس الأولى عربياً (ص 96).'
    ],
    conceptIds: ['concept-industry-factors', 'concept-food-security']
  }
];
