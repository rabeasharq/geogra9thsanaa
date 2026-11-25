export interface SideBySideEntity {
  id: string;
  name: string;
  groupId: string;
  governorateOrCountry: string;
  categoryLabel: string;
  pageRef: string;
  unitId: string;
  lessonId: string;
  atlasLocationId?: string;
  attributes: {
    label: string;
    value: string;
  }[];
  ministerialDistinction: string;
}

export interface SideBySideGroup {
  id: string;
  label: string;
  defaultPair: [string, string];
}

export const SIDE_BY_SIDE_GROUPS: SideBySideGroup[] = [
  {
    id: 'oil_gas',
    label: 'حقول النفط والغاز والأنابيب',
    defaultPair: ['sbs-safer-oil', 'sbs-masila-oil']
  },
  {
    id: 'factories',
    label: 'المصانع والأسمنت',
    defaultPair: ['sbs-bajil-cement', 'sbs-barah-cement']
  },
  {
    id: 'airports',
    label: 'المطارات الدولية',
    defaultPair: ['sbs-rayyan-airport', 'sbs-seiyun-airport']
  },
  {
    id: 'minerals',
    label: 'المعادن ومناطق الاستخراج',
    defaultPair: ['sbs-iron-saada', 'sbs-gold-nihm']
  },
  {
    id: 'ports',
    label: 'الموانئ البحرية والنفطية',
    defaultPair: ['sbs-ras-isa-port', 'sbs-dabba-port']
  },
  {
    id: 'dams_landmarks',
    label: 'السدود والمعالم التاريخية',
    defaultPair: ['sbs-abyan-coast', 'sbs-ghadeer-coast']
  },
  {
    id: 'yemen_natural_regions',
    label: 'تضاريس ومناخ اليمن (الوحدة 1)',
    defaultPair: ['sbs-tihamah-plain', 'sbs-western-highlands']
  },
  {
    id: 'arab_physical_features',
    label: 'تضاريس وممرات الوطن العربي (الوحدة 3)',
    defaultPair: ['sbs-toubkal-peak', 'sbs-nabi-shuayb-arab']
  }
];

export const SIDE_BY_SIDE_ENTITIES: SideBySideEntity[] = [
  // 1. Oil & Gas
  {
    id: 'sbs-safer-oil',
    name: 'حقل صافر النفطي',
    groupId: 'oil_gas',
    governorateOrCountry: 'محافظة مأرب',
    categoryLabel: 'حقل نفطي وغازي رئيس',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-marib-safer',
    attributes: [
      { label: 'الأسبقية التاريخية', value: 'أول بئر نفطي تجاري في اليمن (حُفر عام 1984م)' },
      { label: 'ميناء التصدير عبر الأنبوب', value: 'ميناء رأس عيسى (محافظة الحديدة) غرباً على البحر الأحمر' },
      { label: 'الموارد المرافقة', value: 'إنتاج الغاز الطبيعي والملح الصخري في صافر' }
    ],
    ministerialDistinction: 'يُضخ نفط صافر بمأرب غرباً إلى ميناء رأس عيسى بالحديدة، بعكس نفط المسيلة بحضرموت الذي يتجه جنوباً إلى ميناء الضبة.'
  },
  {
    id: 'sbs-masila-oil',
    name: 'حقل المسيلة النفطي',
    groupId: 'oil_gas',
    governorateOrCountry: 'محافظة حضرموت',
    categoryLabel: 'حقل نفطي رئيس',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-mukalla-port',
    attributes: [
      { label: 'منطقة الاستخراج', value: 'هضبة حضرموت (ضمن المحافظات الأربع المنتجة للنفط)' },
      { label: 'ميناء التصدير عبر الأنبوب', value: 'ميناء الضبة النفطي (شرق المكلا بمحافظة حضرموت) على البحر العربي' },
      { label: 'الموارد المرافقة', value: 'تشارك حضرموت أيضاً مع مأرب في إنتاج الغاز الطبيعي' }
    ],
    ministerialDistinction: 'أكبر حقول حضرموت النفطية؛ يصب أنبوبه في ميناء الضبة بحضرموت على البحر العربي وليس البحر الأحمر.'
  },
  {
    id: 'sbs-shabwa-jawf-oil',
    name: 'مناطق استخراج النفط في شبوة والجوف',
    groupId: 'oil_gas',
    governorateOrCountry: 'محافظتا شبوة والجوف',
    categoryLabel: 'حقول ومناطق استخراج نفطية',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-marib-safer',
    attributes: [
      { label: 'الموقع في خريطة النفط', value: 'تُضافان إلى مأرب وحضرموت لتشكيل المحافظات الأربع المقررة لاستخراج النفط' },
      { label: 'الثروات المرافقة في شبوة', value: 'استخراج الملح الصخري والرخام إلى جانب النفط' },
      { label: 'الثروات المرافقة في الجوف', value: 'سهول وأودية داخلية ومناطق استكشاف نفطي' }
    ],
    ministerialDistinction: 'تحفظ قاعدة الكتاب: يُستخرج النفط في اليمن في 4 محافظات هي: مأرب، حضرموت، شبوة، والجوف.'
  },
  {
    id: 'sbs-arab-oil-gas',
    name: 'النفط والغاز في الوطن العربي',
    groupId: 'oil_gas',
    governorateOrCountry: 'دول الخليج والعراق وليبيا والجزائر',
    categoryLabel: 'ثروة طاقة عربية استراتيجية',
    pageRef: 'ص 101',
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    atlasLocationId: 'loc-arabian-gulf-oil',
    attributes: [
      { label: 'حصة النفط عالمياً', value: 'أكثر من 26% من الإنتاج العالمي للنفط' },
      { label: 'نسبة التصدير', value: 'يُصدّر الوطن العربي نحو 86% من إنتاجه النفطي' },
      { label: 'حصة الغاز عالمياً', value: 'ينتج أكثر من 13% من الغاز الطبيعي في العالم' }
    ],
    ministerialDistinction: 'ترد النسب الثلاث في الصواب والخطأ والاختيار المتعدد: >26% نفط عالمياً، 86% تصدير، >13% غاز طبيعي.'
  },

  // 2. Factories
  {
    id: 'sbs-bajil-cement',
    name: 'مصنع أسمنت باجل',
    groupId: 'factories',
    governorateOrCountry: 'محافظة الحديدة',
    categoryLabel: 'صناعة تحويلية حديثة (مواد بناء)',
    pageRef: 'ص 46، 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-hodeidah-port',
    attributes: [
      { label: 'المادة الخام المجاورة', value: 'محاجر الحجر الجيري في باجل والجبس من الصليف' },
      { label: 'النطاق الجغرافي', value: 'سهل تهامة (غرب اليمن)' },
      { label: 'التصنيف الصناعي', value: 'صناعة تحويلية حديثة لمواد البناء' }
    ],
    ministerialDistinction: 'يمثل مصنع أسمنت باجل الساحل الغربي (الحديدة)، بينما يمثل عمران المرتفعات، والبرح تعز.'
  },
  {
    id: 'sbs-amran-cement',
    name: 'مصنع أسمنت عمران',
    groupId: 'factories',
    governorateOrCountry: 'محافظة عمران',
    categoryLabel: 'صناعة تحويلية حديثة (مواد بناء)',
    pageRef: 'ص 46، 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-thula-dar-hajar',
    attributes: [
      { label: 'المادة الخام المجاورة', value: 'تتوفر خامات الحجر الجيري في محافظة عمران' },
      { label: 'النطاق الجغرافي', value: 'المرتفعات الجبلية الوسطى شمال صنعاء' },
      { label: 'التشجيع الحكومي', value: 'إعفاء الصادرات من الرسوم والضرائب لـ 5 سنوات' }
    ],
    ministerialDistinction: 'يقع في محافظة عمران، وهي المحافظة نفسها التي تضم مدينة ثلا وجسر شهارة وقاع البون.'
  },
  {
    id: 'sbs-barah-cement',
    name: 'مصنع أسمنت البرح',
    groupId: 'factories',
    governorateOrCountry: 'محافظة تعز',
    categoryLabel: 'صناعة تحويلية حديثة (مواد بناء)',
    pageRef: 'ص 46، 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-taiz-city',
    attributes: [
      { label: 'المادة الخام المجاورة', value: 'الحجر الجيري في البرح + الجبس والرخام في تعز' },
      { label: 'النطاق الجغرافي', value: 'المنحدرات الغربية لمحافظة تعز نحو المخا' },
      { label: 'المقارنة', value: 'أحد مصانع الأسمنت الثلاثة المقررة بالكتاب (باجل، عمران، البرح)' }
    ],
    ministerialDistinction: 'كثيراً ما يُخلط بين البرح (تعز) وباجل (الحديدة)؛ تذكر أن «البرح» في تعز و«باجل» في الحديدة.'
  },
  {
    id: 'sbs-handicrafts-yemen',
    name: 'الصناعات الحرفية اليدوية في اليمن',
    groupId: 'factories',
    governorateOrCountry: 'المدن التاريخية والأسواق التقليدية باليمن',
    categoryLabel: 'صناعة حرفية تقليدية',
    pageRef: 'ص 46',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-sanaa-city',
    attributes: [
      { label: 'مقوماتها الرئيسة', value: 'تعتمد على المهارة الفردية ورأس المال المحدود' },
      { label: 'أشهر منتجاتها المقررة', value: 'صناعة الفضة، الجنابي، النقش على الخشب، والمنسوجات التقليدية' },
      { label: 'علاقتها بالسياحة', value: 'تزدهر بانتعاش السياحة الثقافية والتاريخية' }
    ],
    ministerialDistinction: 'تُقارن بالصناعة الحديثة التي تعتمد على الآلات ورأس المال الكبير وتنتج الأغذية والأسمنت وتدوير المخلفات.'
  },

  // 3. Airports
  {
    id: 'sbs-sanaa-airport',
    name: 'مطار صنعاء الدولي',
    groupId: 'airports',
    governorateOrCountry: 'أمانة العاصمة',
    categoryLabel: 'مطار دولي في المرتفعات',
    pageRef: 'ص 52',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-sanaa-city',
    attributes: [
      { label: 'الموقع التضاريسي', value: 'النطاق الجبلي الأوسط (قاع صنعاء)' },
      { label: 'الدور المقرر', value: 'المطار الدولي الرئيس في العاصمة للربط الداخلي والخارجي' },
      { label: 'التكامل مع النقل البري', value: 'يرتبط بشبكة الطرق البرية الرابطة لمختلف المحافظات' }
    ],
    ministerialDistinction: 'أحد المطارات السبعة الدولية المقررة في النقل الجوي باليمن (صنعاء، عدن، الريان، تعز، الحديدة، سقطرى، سيئون).'
  },
  {
    id: 'sbs-aden-airport',
    name: 'مطار عدن الدولي',
    groupId: 'airports',
    governorateOrCountry: 'محافظة عدن',
    categoryLabel: 'مطار دولي ساحلي (جنوباً)',
    pageRef: 'ص 52',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-aden-port',
    attributes: [
      { label: 'الموقع الساحلي', value: 'خور مكسر – محافظة عدن على خليج عدن' },
      { label: 'التكامل الملاحي', value: 'يتكامل مع ميناء عدن الدولي في خدمة التجارة والسياحة' },
      { label: 'القرب من المعالم', value: 'يجاور ساحل أبين وصهاريج عدن وقلعة صيرة' }
    ],
    ministerialDistinction: 'ثاني أكبر محور للنقل الجوي إلى جانب مطار صنعاء، ويخدم الساحل الجنوبي.'
  },
  {
    id: 'sbs-rayyan-airport',
    name: 'مطار الريان الدولي',
    groupId: 'airports',
    governorateOrCountry: 'محافظة حضرموت (الساحل)',
    categoryLabel: 'مطار دولي ساحلي (شرقاً)',
    pageRef: 'ص 52',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-mukalla-port',
    attributes: [
      { label: 'الموقع الجغرافي', value: 'على ساحل البحر العربي قرب مدينة المكلا' },
      { label: 'التمييز داخل المحافظة', value: 'مطار ساحل حضرموت (بخلاف مطار سيئون في الوادي)' },
      { label: 'المعالم والموانئ القريبة', value: 'ميناء المكلا، ميناء الضبة، ومحمية شرمة وغيل باوزير' }
    ],
    ministerialDistinction: 'لحضرموت مطاران دوليان في الكتاب: الريان على الساحل، وسيئون في الوادي والصحراء.'
  },
  {
    id: 'sbs-seiyun-airport',
    name: 'مطار سيئون الدولي',
    groupId: 'airports',
    governorateOrCountry: 'محافظة حضرموت (الوادي)',
    categoryLabel: 'مطار دولي داخلي (وادي حضرموت)',
    pageRef: 'ص 52',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-seiyun-ghail',
    attributes: [
      { label: 'الموقع الجغرافي', value: 'قلب وادي حضرموت الداخلي (مدينة سيئون)' },
      { label: 'المعالم القريبة', value: 'قصر سيئون ومدينة شبام حضرموت التاريخية' },
      { label: 'التمييز داخل المحافظة', value: 'يخدم مناطق الوادي والصحراء، مقابل مطار الريان على الساحل' }
    ],
    ministerialDistinction: 'مطار داخلي دولي في وادي حضرموت، بينما مطار الريان يقع على ساحل حضرموت.'
  },
  {
    id: 'sbs-socotra-airport',
    name: 'مطار سقطرى الدولي',
    groupId: 'airports',
    governorateOrCountry: 'محافظة أرخبيل سقطرى',
    categoryLabel: 'مطار دولي جزري',
    pageRef: 'ص 52',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-socotra-island',
    attributes: [
      { label: 'الأهمية الاستراتيجية', value: 'الشريان الجوي الرئيس لربط الأرخبيل بالوطن الأم والعالم' },
      { label: 'البُعد البيئي والسياحي', value: 'يخدم السياحة البيئية في أكبر محمية يمنية (3,700 كم²)' },
      { label: 'الموقع المائي', value: 'في المحيط الهندي جنوب شرق اليمن' }
    ],
    ministerialDistinction: 'يمثل النقل الجوي المنفذ الأسرع لجزيرة سقطرى نظراً لبعدها في المحيط الهندي.'
  },

  // 4. Minerals
  {
    id: 'sbs-iron-saada',
    name: 'معدن الحديد',
    groupId: 'minerals',
    governorateOrCountry: 'محافظة صعدة',
    categoryLabel: 'معدن فلزي في اليمن',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-yemen-center',
    attributes: [
      { label: 'أسلوب الاستخراج في اليمن', value: 'يُستخرج في محافظة صعدة بطرائق بدائية' },
      { label: 'مقارنة عربية', value: 'تتصدر موريتانيا إنتاجه عربياً بـ 11,500 ألف طن' },
      { label: 'الحالة الاقتصادية', value: 'خام متوفر في شمال اليمن ولم يُستغل صناعياً على نطاق واسع' }
    ],
    ministerialDistinction: 'في اليمن يرتبط خام الحديد بمحافظة صعدة ويُستخرج بطرائق بدائية، أما عربياً فموريتانيا الأولى.'
  },
  {
    id: 'sbs-gold-nihm',
    name: 'الذهب والزنك والرصاص والفضة',
    groupId: 'minerals',
    governorateOrCountry: 'محافظة صنعاء (جبل صلب – نهم)',
    categoryLabel: 'معادن فلزية وثمينة في اليمن',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-sanaa-city',
    attributes: [
      { label: 'الموضع الدقيق', value: 'جبل صلب في مديرية نهم بمحافظة صنعاء' },
      { label: 'حالة الاستغلال المقررة', value: 'خامات الزنك والرصاص والفضة غير مستغلة تجارياً حتى الآن' },
      { label: 'التمييز المكاني', value: 'تقع في محافظة صنعاء وليس في أمانة العاصمة' }
    ],
    ministerialDistinction: 'جبل صلب في نهم (محافظة صنعاء) هو الموقع المقرر للذهب وخامات الزنك والرصاص والفضة.'
  },
  {
    id: 'sbs-copper-haifan',
    name: 'معدن النحاس',
    groupId: 'minerals',
    governorateOrCountry: 'محافظة تعز (حيفان) ومحافظة البيضاء',
    categoryLabel: 'معدن فلزي في اليمن',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-taiz-city',
    attributes: [
      { label: 'مواضعه باليمن', value: 'حيفان في محافظة تعز، ومناطق في محافظة البيضاء' },
      { label: 'مقارنة عربية', value: 'تتصدره عربياً سلطنة عُمان والمغرب' },
      { label: 'التمييز عن الجبس', value: 'النحاس في حيفان بتعز والبيضاء، بينما الجبس في الصليف وبني حشيش وتعز' }
    ],
    ministerialDistinction: 'احفظ الموضعين لخام النحاس في اليمن: حيفان (تعز) والبيضاء.'
  },
  {
    id: 'sbs-salt-salif',
    name: 'الملح الصخري والجبس',
    groupId: 'minerals',
    governorateOrCountry: 'الحديدة (الصليف)، مأرب (صافر)، شبوة، صنعاء (بني حشيش)',
    categoryLabel: 'معادن لا فلزية',
    pageRef: 'ص 48، 51',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-salif-port',
    attributes: [
      { label: 'مواقع الملح الصخري', value: 'الصليف (الحديدة)، صافر (مأرب)، ومحافظة شبوة' },
      { label: 'مواقع الجبس', value: 'الصليف (الحديدة)، بني حشيش (صنعاء)، وتعز' },
      { label: 'التصدير', value: 'يُعد ميناء الصليف منفذاً بحرياً لتصدير الملح الصخري' }
    ],
    ministerialDistinction: 'الصليف (محافظة الحديدة) يشترك فيها الملح الصخري والجبس معاً؛ وبني حشيش في صنعاء خاصة بالجبس.'
  },

  // 5. Ports
  {
    id: 'sbs-ras-isa-port',
    name: 'ميناء رأس عيسى النفطي',
    groupId: 'ports',
    governorateOrCountry: 'محافظة الحديدة (البحر الأحمر)',
    categoryLabel: 'ميناء نفطي متخصص',
    pageRef: 'ص 48، 51',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-salif-port',
    attributes: [
      { label: 'الساحل البحري', value: 'ساحل البحر الأحمر (شمال الحديدة)' },
      { label: 'الحقل المغذي له', value: 'يرتبط بخط أنابيب من حقل صافر في محافظة مأرب' },
      { label: 'التمييز عن الحديدة', value: 'رأس عيسى ميناء نفطي، بينما الحديدة ميناء تجاري عام' }
    ],
    ministerialDistinction: 'انتبه في الخريطة (س50): رأس عيسى بالحديدة يستقبل نفط مأرب (صافر)، لا نفط المسيلة!'
  },
  {
    id: 'sbs-dabba-port',
    name: 'ميناء الضبة النفطي',
    groupId: 'ports',
    governorateOrCountry: 'محافظة حضرموت (البحر العربي)',
    categoryLabel: 'ميناء نفطي متخصص',
    pageRef: 'ص 48',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-mukalla-port',
    attributes: [
      { label: 'الساحل البحري', value: 'ساحل البحر العربي (شرق المكلا)' },
      { label: 'الحقل المغذي له', value: 'يرتبط بخط أنابيب من حقل المسيلة بمحافظة حضرموت' },
      { label: 'التمييز عن المكلا', value: 'المكلا ميناء تجاري، والضبة ميناء لتصدير النفط بحضرموت' }
    ],
    ministerialDistinction: 'يصدر نفط المسيلة عبر الضبة على البحر العربي، بينما يصدر نفط صافر عبر رأس عيسى على البحر الأحمر.'
  },
  {
    id: 'sbs-mokha-port',
    name: 'ميناء المخا',
    groupId: 'ports',
    governorateOrCountry: 'محافظة تعز (البحر الأحمر)',
    categoryLabel: 'ميناء بحري تاريخي',
    pageRef: 'ص 45، 51',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    atlasLocationId: 'loc-mokha-coffee',
    attributes: [
      { label: 'المحافظة التي يتبعها', value: 'محافظة تعز (جنوب الساحل الغربي قرب باب المندب)' },
      { label: 'الشهرة العالمية', value: 'ارتبط اسمه تاريخياً بتصدير البن اليمني (بن مخا)' },
      { label: 'التمييز الساحلي', value: 'يقع على البحر الأحمر وليس على خليج عدن' }
    ],
    ministerialDistinction: 'أحد الموانئ الستة الرئيسة بالكتاب؛ يتبع محافظة تعز لا الحديدة ولا لحج.'
  },

  // 6. Dams & Landmarks
  {
    id: 'sbs-abyan-coast',
    name: 'ساحل أبين',
    groupId: 'dams_landmarks',
    governorateOrCountry: 'محافظة عدن (خور مكسر)',
    categoryLabel: 'معلم ساحلي وترفيهي',
    pageRef: 'ص 54',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    atlasLocationId: 'loc-aden-coast-landmarks',
    attributes: [
      { label: 'الفخ الوزاري الأشهر', value: 'يقع داخل محافظة عدن (خور مكسر) وليس في محافظة أبين!' },
      { label: 'المعالم المجاورة له', value: 'صهاريج عدن، قلعة صيرة، مسجد العيدروس، وساحل الغدير' },
      { label: 'النوع السياحي', value: 'سياحة ساحلية وترفيهية على خليج عدن' }
    ],
    ministerialDistinction: 'رغم تسميته «ساحل أبين» إلا أنه من معالم محافظة عدن إدارياً وجغرافياً.'
  },
  {
    id: 'sbs-ghadeer-coast',
    name: 'ساحل الغدير',
    groupId: 'dams_landmarks',
    governorateOrCountry: 'محافظة عدن (البريقة)',
    categoryLabel: 'معلم ساحلي وترفيهي',
    pageRef: 'ص 54',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    atlasLocationId: 'loc-aden-coast-landmarks',
    attributes: [
      { label: 'الموقع الإداري', value: 'مديرية البريقة غرب محافظة عدن' },
      { label: 'المقارنة مع الخوخة', value: 'ساحل الغدير في عدن، بينما ساحل الخوخة في محافظة الحديدة' },
      { label: 'النوع السياحي', value: 'شاطئ ومنتجع ساحلي للسياحة الداخلية' }
    ],
    ministerialDistinction: 'يجمع بين السياحة الساحلية والترفيهية في عدن، ويُقارن بساحل أبين (عدن) وساحل الخوخة (الحديدة).'
  },
  {
    id: 'sbs-marib-dam',
    name: 'سد مأرب',
    groupId: 'dams_landmarks',
    governorateOrCountry: 'محافظة مأرب',
    categoryLabel: 'منشأة مائية ومعلم تاريخي',
    pageRef: 'ص 24 – 25، 54',
    unitId: 'unit-1',
    lessonId: 'u1-l4',
    atlasLocationId: 'loc-marib-dam',
    attributes: [
      { label: 'الوادي المقام عليه', value: 'وادي أذنة (يتجه شرقاً من المرتفعات)' },
      { label: 'الأهمية المزدوجة', value: 'خزن مياه السيول للري الزراعي + معلم أثري وسياحي' },
      { label: 'السدود المقابلة بالدرس', value: 'سد كمران وسد مختان (ص 24 – 25)' }
    ],
    ministerialDistinction: 'يجمع بين درس المياه (ص 25) ودرس السياحة (ص 54) في محافظة مأرب.'
  },

  // 7. Yemen Natural Regions (Unit 1)
  {
    id: 'sbs-tihamah-plain',
    name: 'السهل الساحلي الغربي (تهامة)',
    groupId: 'yemen_natural_regions',
    governorateOrCountry: 'الغرب على البحر الأحمر',
    categoryLabel: 'سهل ساحلي (الوحدة 1)',
    pageRef: 'ص 14، 19',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    atlasLocationId: 'loc-tihamah',
    attributes: [
      { label: 'الامتداد والارتفاع', value: 'من الشيخ سعيد جنوباً حتى الحدود السعودية شمالاً · اتساع 20–60 كم · أقصى ارتفاع 200م' },
      { label: 'أبرز الأودية', value: 'مور، سردد، سهام، رماع، زبيد، رسيان، موزع' },
      { label: 'الإقليم المناخي', value: 'إقليم السهول الساحلية: شبه مداري حار رطب بمدى حراري صغير' }
    ],
    ministerialDistinction: 'أودية تهامة تصب غرباً في البحر الأحمر، وتُميَّز عن أودية السهل الجنوبي (تبن وبنا وأحور والمسيلة).'
  },
  {
    id: 'sbs-western-highlands',
    name: 'المرتفعات الجبلية الغربية',
    groupId: 'yemen_natural_regions',
    governorateOrCountry: 'العمود الفقري من صعدة إلى لحج',
    categoryLabel: 'مرتفعات وقيعان (الوحدة 1)',
    pageRef: 'ص 14 – 15، 19',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    atlasLocationId: 'loc-nabi-shuayb',
    attributes: [
      { label: 'أعلى القمم والقيعان', value: 'جبل النبي شعيب (3,670م) وجبل أسبيل (3,190م) + قيعان صعدة والبون وصنعاء وجهران' },
      { label: 'تغير الحرارة بالارتفاع', value: 'تنخفض درجة الحرارة 1°م كلما ارتفعنا 150م عن سطح البحر' },
      { label: 'الإقليم المناخي (>1500م)', value: 'معتدل صيفاً بارد شتاءً بمدى حراري كبير وقد يتكون الصقيع في القيعان' }
    ],
    ministerialDistinction: 'النبي شعيب (3,670م) غرب صنعاء أعلى قمة في اليمن وشبه الجزيرة العربية، ويتلقى النطاق الغربي أمطاراً صيفية موسمية.'
  },
  {
    id: 'sbs-eastern-plateaus',
    name: 'الهضاب والسهول الشرقية',
    groupId: 'yemen_natural_regions',
    governorateOrCountry: 'شرق وشمال شرق المرتفعات',
    categoryLabel: 'هضاب داخلية وصحراوية (الوحدة 1)',
    pageRef: 'ص 15، 19',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    atlasLocationId: 'loc-hadramout-plateau',
    attributes: [
      { label: 'أبرز الهضاب', value: 'هضبة البيضاء، رداع، الجدعان بمأرب، وهضبة حضرموت (شمالية وجنوبية يفصلهما وادي حضرموت)' },
      { label: 'أبرز الأودية', value: 'أودية الجوف وأذنة وبيحان المتجهة نحو الصحراء الشرقية' },
      { label: 'الإقليم المناخي', value: 'إقليم المناطق الداخلية والشرقية: مناخ صحراوي جاف قاري يقل مطره نحو الربع الخالي' }
    ],
    ministerialDistinction: 'تنتهي أطرافها الشمالية الشرقية بصحراء الربع الخالي، ويفصل وادي حضرموت ثنيتي هضبة حضرموت.'
  },

  // 8. Arab World Physical Features (Unit 3)
  {
    id: 'sbs-toubkal-peak',
    name: 'جبل طوبقال (جبال أطلس)',
    groupId: 'arab_physical_features',
    governorateOrCountry: 'المملكة المغربية (الجناح الأفريقي)',
    categoryLabel: 'جبال التوائية (الوحدة 3)',
    pageRef: 'ص 67 – 68',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    atlasLocationId: 'loc-atlas-mountains',
    attributes: [
      { label: 'الارتفاع والترتيب', value: '4,165 متر — أعلى قمة جبلية في الوطن العربي كله' },
      { label: 'نوع النشأة التضاريسية', value: 'جبال التوائية (مع جبال عمان وزاجروس وطوروس وكردستان)' },
      { label: 'الإقليم المناخي السائد', value: 'إقليم البحر المتوسط في الأطراف الشمالية الغربية' }
    ],
    ministerialDistinction: 'يُفرَّق بين طوبقال (4,165م أعلى قمة بالوطن العربي) والنبي شعيب (3,670م أعلى قمة بشبه الجزيرة العربية).'
  },
  {
    id: 'sbs-nabi-shuayb-arab',
    name: 'جبل النبي شعيب (مرتفعات اليمن)',
    groupId: 'arab_physical_features',
    governorateOrCountry: 'الجمهورية اليمنية (الجناح الآسيوي)',
    categoryLabel: 'جبال انكسارية وبركانية (الوحدة 3)',
    pageRef: 'ص 67 – 68',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    atlasLocationId: 'loc-nabi-shuayb',
    attributes: [
      { label: 'الارتفاع والترتيب', value: '3,670 متر — أعلى قمة في شبه الجزيرة العربية واليمن' },
      { label: 'نوع النشأة في الكتاب', value: 'جبال انكسارية (مرتفعات اليمن والحجاز وعسير والشام) مع أجزاء بركانية' },
      { label: 'الإقليم المناخي', value: 'ضمن نطاق الإقليم المداري في جنوب غرب شبه الجزيرة العربية' }
    ],
    ministerialDistinction: 'انتبه في التصنيف: جبال أطلس وعمان التوائية، بينما مرتفعات اليمن والحجاز والبحر الأحمر والشام انكسارية.'
  },
  {
    id: 'sbs-arab-wings-ratio',
    name: 'الجناح الأفريقي مقابل الجناح الآسيوي',
    groupId: 'arab_physical_features',
    governorateOrCountry: '22 دولة عربية (10 أفريقية · 12 آسيوية)',
    categoryLabel: 'التوزيع القاري (الوحدة 3)',
    pageRef: 'ص 61، 64',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    atlasLocationId: 'loc-arab-world-center',
    attributes: [
      { label: 'نسبة المساحة (من 13.3 مليون كم²)', value: '71% في الجناح الأفريقي و29% في الجناح الآسيوي' },
      { label: 'عدد الدول في كل جناح', value: '10 دول في أفريقيا (منها جزر القمر) مقابل 12 دولة في آسيا (منها اليمن)' },
      { label: 'الهضبة الرئيسة', value: 'هضبة أفريقيا الشمالية (الأوسع) مقابل هضبة شبه الجزيرة العربية' }
    ],
    ministerialDistinction: 'الأكثر مساحة (71%) هو الجناح الأفريقي رغم أن عدد دوله أقل (10 دول)، بينما الجناح الآسيوي 12 دولة بمساحة 29%.'
  }
];
