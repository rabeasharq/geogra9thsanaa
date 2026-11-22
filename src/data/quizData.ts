import { QuizQuestion, ErrataRecord } from '../types/textbook';
import {
  MINISTERIAL_QUESTIONS,
  MINISTERIAL_BATCH_STATS,
  MINISTERIAL_TOPIC_FREQUENCY
} from './ministerialQuestions';
import { GENERATED_QUESTIONS } from './generatedQuestions';

export const CORE_TEXTBOOK_QUESTIONS: QuizQuestion[] = [
  // ================= UNIT 1 =================
  {
    id: 'q-u1-1',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 9، 12',
    sourceLabel: 'الوحدة 1 · الدرس 1 · ص 9',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تمتد الجمهورية اليمنية فلكياً بين دائرتي عرض وخطي طول:',
    options: [
      '12°–19° شمالاً و41°–55° شرقاً',
      '2°–37° شمالاً و17°–60° شرقاً',
      '11°–13° جنوباً و43°–46° شرقاً',
      '15°–25° شمالاً و35°–50° شرقاً'
    ],
    correctAnswer: '12°–19° شمالاً و41°–55° شرقاً',
    explanation: 'وفق ص 9 تقع اليمن بين دائرتي عرض 12° و19° شمال خط الاستواء، وخطي طول 41° و55° شرق خط جرينتش.',
    relatedLocationId: 'loc-yemen-center'
  },
  {
    id: 'q-u1-2',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 9 – 10',
    sourceLabel: 'الوحدة 1 · الدرس 1 · ص 9 – 10',
    type: 'true_false',
    cognitiveLevel: 'تذكر',
    prompt: 'يتكون أرخبيل سقطرى من 6 جزر وتبلغ مساحته نحو 3,700 كم².',
    options: ['صواب', 'خطأ'],
    correctAnswer: 'صواب',
    explanation: 'ورد في ص 10 أن أرخبيل سقطرى أكبر الجزر اليمنية ويتكون من 6 جزر ومساحته نحو 3,700 كم².',
    relatedLocationId: 'loc-socotra-island'
  },
  {
    id: 'q-u1-3',
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    pageRef: 'ص 10 – 11',
    sourceLabel: 'الوحدة 1 · الدرس 1 · ص 10 – 11',
    type: 'mcq',
    cognitiveLevel: 'فهم',
    prompt: 'لا يتجاوز عرض مضيق باب المندب بين الساحل اليمني والساحل الأفريقي:',
    options: ['30 كم', '100 كم', '154 كم', '220 كم'],
    correctAnswer: '30 كم',
    explanation: 'يبلغ عرض مضيق باب المندب أقل من 30 كم وتقسمه جزيرة ميون إلى ممرين (ص 10).',
    relatedLocationId: 'loc-bab-el-mandeb'
  },
  {
    id: 'q-u1-4',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 14',
    sourceLabel: 'الوحدة 1 · الدرس 2 · ص 14',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'أعلى قمة جبلية في الجمهورية اليمنية وشبه الجزيرة العربية هي قمة:',
    options: ['جبل النبي شعيب (3,670م)', 'جبل أسبيل (3,190م)', 'جبل طوبقال (4,165م)', 'جبل صبر (3,000م)'],
    correctAnswer: 'جبل النبي شعيب (3,670م)',
    explanation: 'يرتفع جبل النبي شعيب إلى 3,670 متراً غرب صنعاء ضمن النطاق الجبلي الأوسط، بينما يرتفع جبل أسبيل إلى 3,190 متراً شرق ذمار (ص 14–15).',
    relatedLocationId: 'loc-nabi-shuayb'
  },
  {
    id: 'q-u1-5',
    unitId: 'unit-1',
    lessonId: 'u1-l2',
    pageRef: 'ص 14 – 16',
    sourceLabel: 'الوحدة 1 · الدرس 2 · ص 14 – 16',
    type: 'fill_blank',
    cognitiveLevel: 'تذكر',
    prompt: 'يمتد السهل الساحلي الغربي (تهامة) باتساع يتراوح بين ....... و....... كيلومتراً وأقصى ارتفاع له 200 متر.',
    options: ['20 و60', '10 و30', '80 و120', '5 و15'],
    correctAnswer: '20 و60',
    explanation: 'نص ص 14: يتراوح اتساع السهل الساحلي الغربي بين 20 و60 كم، وأقصى ارتفاع له 200 متر.',
    relatedLocationId: 'loc-tihamah'
  },
  {
    id: 'q-u1-6',
    unitId: 'unit-1',
    lessonId: 'u1-l3',
    pageRef: 'ص 17، 23',
    sourceLabel: 'الوحدة 1 · الدرس 3 · ص 17',
    type: 'mcq',
    cognitiveLevel: 'تطبيق',
    prompt: 'تنخفض درجة الحرارة في المرتفعات اليمنية بمعدل 1° مئوية كلما ارتفعنا عن سطح البحر بمقدار:',
    options: ['150 متراً', '50 متراً', '500 متر', '1,000 متر'],
    correctAnswer: '150 متراً',
    explanation: 'وفق قاعدة التضاريس والمناخ في ص 17: تنخفض الحرارة بمعدل درجة مئوية واحدة لكل 150 متراً ارتفاعاً.',
    relatedLocationId: 'loc-nabi-shuayb'
  },
  {
    id: 'q-u1-7',
    unitId: 'unit-1',
    lessonId: 'u1-l3',
    pageRef: 'ص 18، 23',
    sourceLabel: 'الوحدة 1 · الدرس 3 · ص 18',
    type: 'mcq',
    cognitiveLevel: 'فهم',
    prompt: 'تهب على اليمن في فصل الصيف (عند تعامد الشمس على مدار السرطان في 21 يونيو) رياح:',
    options: [
      'جنوبية غربية موسمية رطبة ممطرة',
      'شمالية شرقية جافة باردة',
      'غربية قطبية متجمدة',
      'شمالية غربية جافة'
    ],
    correctAnswer: 'جنوبية غربية موسمية رطبة ممطرة',
    explanation: 'في 21 يونيو يتشكل ضغط منخفض على اليابس فتنجذب إليه الرياح الموسمية الجنوبية الغربية الرطبة من المحيط الهندي مسببة أمطاراً صيفية (ص 18).',
    relatedLocationId: 'loc-tihamah'
  },
  {
    id: 'q-u1-8',
    unitId: 'unit-1',
    lessonId: 'u1-l4',
    pageRef: 'ص 26، 28',
    sourceLabel: 'الوحدة 1 · الدرس 4 · ص 26',
    type: 'matching',
    cognitiveLevel: 'تطبيق',
    prompt: 'طابق كل وادٍ يمني باتجاه مصبه الصحيح وفق ص 26:',
    matchingPairs: [
      { left: 'وادي مور ووادي سردد', right: 'يتجه غرباً نحو البحر الأحمر' },
      { left: 'وادي المسيلة (حضرموت) ووادي بنا', right: 'يتجه جنوباً نحو البحر العربي وخليج عدن' },
      { left: 'وادي أذنة ووادي بيحان', right: 'يتجه شرقاً نحو الداخل والصحراء' },
      { left: 'وادي الجوف ووادي الخارد', right: 'يتجه شمالاً نحو أطراف الربع الخالي' }
    ],
    correctAnswer: 'مطابقة تامة',
    explanation: 'تصنيف الأودية الأربعة في ص 26 يوضح أثر انحدار التضاريس في توجيه التصريف المائي.',
    relatedLocationId: 'loc-hadramout-plateau'
  },
  {
    id: 'q-u1-9',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 30 – 33',
    sourceLabel: 'الوحدة 1 · الدرس 5 · ص 30 – 32',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تقع محمية حوف الطبيعية ذات الغابات الموسمية الضبابية في محافظة:',
    options: ['المهرة', 'ذمار', 'لحج', 'الحديدة'],
    correctAnswer: 'المهرة',
    explanation: 'تقع محمية حوف في محافظة المهرة (569 كم²)، وعتمة في ذمار، وإراف في لحج، وبرع في الحديدة، وشرمة في حضرموت (ص 31–32).',
    relatedLocationId: 'loc-hawf-reserve'
  },
  {
    id: 'q-u1-10',
    unitId: 'unit-1',
    lessonId: 'u1-l5',
    pageRef: 'ص 32',
    sourceLabel: 'الوحدة 1 · الدرس 5 · ص 32',
    type: 'true_false',
    cognitiveLevel: 'تذكر',
    prompt: 'تشتهر محمية شرمة الساحلية شرق المكلا بتعشيش السلاحف الخضراء النادرة.',
    options: ['صواب', 'خطأ'],
    correctAnswer: 'صواب',
    explanation: 'وفق ص 32 تبلغ مساحة محمية شرمة 62 كم² وتُعد موطناً لتعشيش السلاحف الخضراء النادرة.',
    relatedLocationId: 'loc-sharma-reserve'
  },
  {
    id: 'q-u1-11',
    unitId: 'unit-1',
    lessonId: 'u1-l4',
    pageRef: 'ص 27 – 28',
    sourceLabel: 'الوحدة 1 · الدرس 4 · ص 27 – 28 (بطاقة تفكير)',
    type: 'guided_essay',
    cognitiveLevel: 'تحليل',
    prompt: 'ما أضرار الجفاف وسوء استغلال المياه الجوفية في اليمن، وما أبرز ثلاثة حلول لترشيد المياه من الكتاب؟',
    correctAnswer: 'أضرار الجفاف: تراجع الإنتاج الزراعي، جفاف الآبار والعيون، تدهور الغطاء النباتي والتصحر، ونزوح السكان. الحلول (ص 27): منع الحفر العشوائي والري بالغمر، التوسع في الري الحديث (التنقيط)، بناء السدود والحواجز، حصاد الأمطار، ومعالجة المياه العادمة.',
    explanation: 'الإجابة مستخلصة من بطاقة التفكير (ص 28) وصندوق ترشيد المياه (ص 27).',
    relatedLocationId: 'loc-marib-dam'
  },

  // ================= UNIT 2 =================
  {
    id: 'q-u2-1',
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    pageRef: 'ص 36، 39',
    sourceLabel: 'الوحدة 2 · الدرس 1 · ص 36',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'بلغ معدل النمو السكاني السنوي في الجمهورية اليمنية نحو 3%، وهذا يعني تضاعف عدد السكان كل:',
    options: ['23 سنة', '10 سنوات', '50 سنة', '7 سنوات'],
    correctAnswer: '23 سنة',
    explanation: 'نص ص 36: بمعدل نمو سنوي 3% يتضاعف سكان الجمهورية اليمنية كل 23 سنة تقريباً.',
    relatedLocationId: 'loc-taiz-city'
  },
  {
    id: 'q-u2-2',
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    pageRef: 'ص 38',
    sourceLabel: 'الوحدة 2 · الدرس 1 · ص 38',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'أي المحافظات التالية سجلت أعلى نسبة سكانية وأيها سجلت أدنى نسبة في الجدول (1)؟',
    options: [
      'الأعلى تعز (12.0%) والأدنى المهرة (0.46%)',
      'الأعلى أمانة العاصمة (12.0%) والأدنى مأرب (0.46%)',
      'الأعلى الحديدة (15.0%) والأدنى ريمة (1.2%)',
      'الأعلى إب (12.0%) والأدنى حضرموت (0.46%)'
    ],
    correctAnswer: 'الأعلى تعز (12.0%) والأدنى المهرة (0.46%)',
    explanation: 'وفق الجدول (1) في ص 38 تتصدر تعز بـ 12.0% ثم الحديدة 11.0% ثم إب 10.7%، بينما أدنى نسبة هي المهرة 0.46%.',
    relatedLocationId: 'loc-al-mahrah'
  },
  {
    id: 'q-u2-3',
    unitId: 'unit-2',
    lessonId: 'u2-l2',
    pageRef: 'ص 41، 58',
    sourceLabel: 'الوحدة 2 · الدرس 2 · ص 41 / تقويم الوحدة 2 ص 58',
    type: 'matching',
    cognitiveLevel: 'تطبيق',
    prompt: 'صل كل مؤشر سكاني بقيمته الرسمية المقررة في الوحدة الثانية (ص 36–41 و58):',
    matchingPairs: [
      { left: 'نسبة البطالة', right: '14.2%' },
      { left: 'نسبة النوع (2017م)', right: '103.6 ذكراً لكل 100 أنثى' },
      { left: 'معدل المواليد الخام (2021م)', right: '30 بالألف' },
      { left: 'معدل الوفيات الخام (2021م)', right: '7 بالألف' },
      { left: 'نسبة الإعالة', right: '94.2%' }
    ],
    correctAnswer: 'مطابقة تامة',
    explanation: 'هذه الإحصائيات مأخوذة نصاً من س4 في تقويم الوحدة الثانية (ص 58) ودروس الوحدة.',
    relatedLocationId: 'loc-sanaa-city'
  },
  {
    id: 'q-u2-4',
    unitId: 'unit-2',
    lessonId: 'u2-l2',
    pageRef: 'ص 40 – 42',
    sourceLabel: 'الوحدة 2 · الدرس 2 · ص 40 – 41',
    type: 'true_false',
    cognitiveLevel: 'فهم',
    prompt: 'يمثل صغار السن (أقل من 15 سنة) نحو 45% من سكان اليمن، مما يعني ارتفاع نسبة الإعالة.',
    options: ['صواب', 'خطأ'],
    correctAnswer: 'صواب',
    explanation: 'ارتفاع نسبة صغار السن (~45%) يؤدي إلى ارتفاع نسبة الإعالة إلى 94.2% وتزايد الحاجة إلى المدارس والخدمات الصحية (ص 40–41).',
    relatedLocationId: 'loc-sanaa-city'
  },
  {
    id: 'q-u2-5',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 48، 53',
    sourceLabel: 'الوحدة 2 · الدرس 3 · ص 48 / تقويم ص 53',
    type: 'true_false',
    cognitiveLevel: 'تذكر',
    prompt: 'يُستخرج الحديد بكميات تجارية كبيرة من البيضاء وتعز.',
    options: ['صواب', 'خطأ'],
    correctAnswer: 'خطأ',
    explanation: 'خطأ؛ وفق ص 48 يوجد الحديد في صعدة ويُستخرج بطرائق بدائية، بينما يوجد النحاس في حيفان بتعز والبيضاء (وردت العبارة في تقويم س2-ج ص 53).',
    relatedLocationId: 'loc-marib-safer'
  },
  {
    id: 'q-u2-6',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 48',
    sourceLabel: 'الوحدة 2 · الدرس 3 · ص 48',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'حُفر أول بئر نفطي تجاري في الجمهورية اليمنية في حقل صافر بمأرب عام:',
    options: ['1984م', '1990م', '1973م', '2004م'],
    correctAnswer: '1984م',
    explanation: 'حُفر أول بئر نفطي في حقل صافر بمأرب عام 1984م (ص 48).',
    relatedLocationId: 'loc-marib-safer'
  },
  {
    id: 'q-u2-7',
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    pageRef: 'ص 46، 51',
    sourceLabel: 'الوحدة 2 · الدرس 3 · ص 46، 51',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تعفي الدولة صادرات المصانع الوطنية في اليمن من الرسوم والضرائب تشجيعاً لها لمدة:',
    options: ['5 سنوات', 'سنة واحدة', '15 سنة', '20 سنة'],
    correctAnswer: '5 سنوات',
    explanation: 'وفق ص 46 تُعفى صادرات المصانع الوطنية من الرسوم والضرائب لمدة 5 سنوات.',
    relatedLocationId: 'loc-hodeidah-port'
  },
  {
    id: 'q-u2-8',
    unitId: 'unit-2',
    lessonId: 'u2-l4',
    pageRef: 'ص 54 – 55',
    sourceLabel: 'الوحدة 2 · الدرس 4 · ص 54',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'يتجاوز عدد المعالم الأثرية والسياحية في الجمهورية اليمنية:',
    options: ['2,288 معلماً', '500 معلم', '154 معلماً', '850 معلماً'],
    correctAnswer: '2,288 معلماً',
    explanation: 'نص ص 54: يضم اليمن أكثر من 2,288 معلماً أثرياً وسياحياً مثل صنعاء القديمة وشبام وسقطرى وصهاريج عدن.',
    relatedLocationId: 'loc-shibam-hadramout'
  },

  // ================= UNIT 3 =================
  {
    id: 'q-u3-1',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 61، 64',
    sourceLabel: 'الوحدة 3 · الدرس 1 · ص 64',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تبلغ مساحة الوطن العربي نحو 13.3 مليون كم²، وتبلغ نسبة الجناح الأفريقي منها:',
    options: ['71% أفريقي و29% آسيوي', '61% أفريقي و39% آسيوي', '50% أفريقي و50% آسيوي', '80% أفريقي و20% آسيوي'],
    correctAnswer: '71% أفريقي و29% آسيوي',
    explanation: 'انتبه للتمييز المهم في الكتاب: تتوزع المساحة 71% أفريقياً و29% آسيوياً (ص 64)، بينما يتوزع السكان 61% أفريقياً و39% آسيوياً (ص 89)!',
    relatedLocationId: 'loc-suez-canal'
  },
  {
    id: 'q-u3-2',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 61',
    sourceLabel: 'الوحدة 3 · الدرس 1 · ص 61',
    type: 'mcq',
    cognitiveLevel: 'فهم',
    prompt: 'الدولة العربية التي تقع خارج الامتداد الفلكي المتصل للوطن العربي (جنوب خط الاستواء بين 11°–13° جنوباً) هي:',
    options: ['جزر القمر', 'الصومال', 'جيبوتي', 'موريتانيا'],
    correctAnswer: 'جزر القمر',
    explanation: 'يمتد الوطن العربي من 2° جنوباً إلى 37°30′ شمالاً عدا جزر القمر الواقعة في المحيط الهندي بين 11°–13° جنوباً و43°–46° شرقاً (ص 61).',
    relatedLocationId: 'loc-comoros'
  },
  {
    id: 'q-u3-3',
    unitId: 'unit-3',
    lessonId: 'u3-l1',
    pageRef: 'ص 63',
    sourceLabel: 'الوحدة 3 · الدرس 1 · ص 63',
    type: 'matching',
    cognitiveLevel: 'تطبيق',
    prompt: 'اربط كل ممر مائي عربي بالمسطحين اللذين يصل بينهما:',
    matchingPairs: [
      { left: 'مضيق هرمز', right: 'يصل الخليج العربي بخليج عمان وبحر العرب' },
      { left: 'مضيق باب المندب', right: 'يصل البحر الأحمر بخليج عدن والمحيط الهندي' },
      { left: 'قناة السويس', right: 'تصل البحر الأحمر بالبحر المتوسط' },
      { left: 'مضيق جبل طارق', right: 'يصل البحر المتوسط بالمحيط الأطلسي' }
    ],
    correctAnswer: 'مطابقة تامة',
    explanation: 'يتحكم الوطن العربي بأربعة ممرات بحرية استراتيجية مذكورة في ص 63.',
    relatedLocationId: 'loc-hormuz'
  },
  {
    id: 'q-u3-4',
    unitId: 'unit-3',
    lessonId: 'u3-l2',
    pageRef: 'ص 67 – 68',
    sourceLabel: 'الوحدة 3 · الدرس 2 · ص 67 – 68',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تُصنّف جبال أطلس في المغرب العربي ضمن الجبال:',
    options: ['الالتوائية (وأعلاها طوبقال 4,165م)', 'الانكسارية', 'البركانية', 'الرسوبية الساحلية'],
    correctAnswer: 'الالتوائية (وأعلاها طوبقال 4,165م)',
    explanation: 'جبال أطلس وعمان وزاجروس جبال التوائية، بينما جبال البحر الأحمر والشام واليمن جبال انكسارية (وتوجد مظاهر بركانية أيضاً)؛ ص 67–68.',
    relatedLocationId: 'loc-atlas-mountains'
  },
  {
    id: 'q-u3-5',
    unitId: 'unit-3',
    lessonId: 'u3-l3',
    pageRef: 'ص 73 – 75، 77',
    sourceLabel: 'الوحدة 3 · الدرس 3 · ص 74',
    type: 'mcq',
    cognitiveLevel: 'فهم',
    prompt: 'أي الأقاليم المناخية في الوطن العربي يتميز بأنه «حار جاف صيفاً، دافئ ممطر شتاءً» وتنمو فيه أشجار الأرز والزيتون؟',
    options: ['إقليم البحر المتوسط', 'الإقليم المداري', 'الإقليم الصحراوي', 'الإقليم الاستوائي'],
    correctAnswer: 'إقليم البحر المتوسط',
    explanation: 'إقليم البحر المتوسط في الأطراف الشمالية مطره شتوي وحرارته معتدلة وتنمو فيه غابات دائمة الخضرة كالأرز والبلوط والزيتون (ص 74).',
    relatedLocationId: 'loc-atlas-mountains'
  },
  {
    id: 'q-u3-6',
    unitId: 'unit-3',
    lessonId: 'u3-l4',
    pageRef: 'ص 80 – 82',
    sourceLabel: 'الوحدة 3 · الدرس 4 · ص 82',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'كم تبلغ حصة الوطن العربي من المياه العذبة المتجددة في العالم؟',
    options: ['5%', '26%', '14.1%', '42%'],
    correctAnswer: '5%',
    explanation: 'رغم مساحة الوطن العربي (10% من العالم)، لا تتجاوز حصته من المياه المتجددة عالمياً 5% (ص 82).',
    relatedLocationId: 'loc-nile-basin'
  },
  {
    id: 'q-u3-7',
    unitId: 'unit-3',
    lessonId: 'u3-l4',
    pageRef: 'ص 82 – 85',
    sourceLabel: 'الوحدة 3 · الدرس 4 · ص 82 / تقويم الوحدة 3 ص 85',
    type: 'guided_essay',
    cognitiveLevel: 'تحليل',
    prompt: 'عرف «الأمن المائي»، واذكر أربعة حلول عملية لمواجهة مشكلة شح المياه في الوطن العربي.',
    correctAnswer: 'الأمن المائي: ضمان توفر المياه الصالحة للاستعمال بكمية ونوعية كافية ومستدامة للسكان والزراعة والصناعة (ص 82). الحلول (ص 83): تحديث أساليب الري، بناء السدود والحصاد المائي، صيانة الشبكات ومنع الهدر، معالجة المياه العادمة، وتطوير تحلية مياه البحر.',
    explanation: 'مستمد من ص 82–83 وسؤال الجدول في تقويم الوحدة الثالثة ص 85.',
    relatedLocationId: 'loc-tigris-euphrates'
  },

  // ================= UNIT 4 =================
  {
    id: 'q-u4-1',
    unitId: 'unit-4',
    lessonId: 'u4-l1',
    pageRef: 'ص 88 – 89',
    sourceLabel: 'الوحدة 4 · الدرس 1 · ص 89',
    type: 'mcq',
    cognitiveLevel: 'تطبيق',
    prompt: 'إذا كان معدل المواليد في الوطن العربي 32 بالألف ومعدل الوفيات 8 بالألف، فإن معدل الزيادة الطبيعية يساوي:',
    options: ['24 بالألف', '40 بالألف', '16 بالألف', '32 بالألف'],
    correctAnswer: '24 بالألف',
    explanation: 'الزيادة الطبيعية = معدل المواليد (32‰) − معدل الوفيات (8‰) = 24 بالألف (ص 89).',
    relatedLocationId: 'loc-nile-basin'
  },
  {
    id: 'q-u4-2',
    unitId: 'unit-4',
    lessonId: 'u4-l1',
    pageRef: 'ص 88 – 89',
    sourceLabel: 'الوحدة 4 · الدرس 1 · ص 88 – 89',
    type: 'true_false',
    cognitiveLevel: 'تذكر',
    prompt: 'يتوزع سكان الوطن العربي (419,780 ألف نسمة عام 2018م) بنسبة 61% في الجناح الأفريقي و39% في الجناح الآسيوي.',
    options: ['صواب', 'خطأ'],
    correctAnswer: 'صواب',
    explanation: 'وفق شكل (1) وشكل (2) في ص 88–89 يعيش 61% من السكان العرب في أفريقيا و39% في آسيا.',
    relatedLocationId: 'loc-nile-basin'
  },
  {
    id: 'q-u4-3',
    unitId: 'unit-4',
    lessonId: 'u4-l2',
    pageRef: 'ص 94 – 95',
    sourceLabel: 'الوحدة 4 · الدرس 2 · ص 94 – 95',
    type: 'mcq',
    cognitiveLevel: 'فهم',
    prompt: 'يُقصد بـ «التوسع الرأسي» في تحقيق الأمن الغذائي العربي:',
    options: [
      'زيادة إنتاجية وحدة المساحة عبر البذور المحسنة والتقنيات الحديثة',
      'زيادة مساحة الأراضي المزروعة باستصلاح أراضٍ جديدة',
      'استيراد القمح من الخارج لسد العجز',
      'تحويل المراعي إلى مناطق صناعية'
    ],
    correctAnswer: 'زيادة إنتاجية وحدة المساحة عبر البذور المحسنة والتقنيات الحديثة',
    explanation: 'التوسع الأفقي يعني زيادة المساحة المزروعة، أما التوسع الرأسي فيعني رفع غلة الهكتار وإنتاجيته بالأساليب العلمية (ص 95).',
    relatedLocationId: 'loc-nile-basin'
  },
  {
    id: 'q-u4-4',
    unitId: 'unit-4',
    lessonId: 'u4-l2',
    pageRef: 'ص 96',
    sourceLabel: 'الوحدة 4 · الدرس 2 · ص 96',
    type: 'mcq',
    cognitiveLevel: 'تذكر',
    prompt: 'تضم قائمة الدول العربية الخمس الأعلى إنتاجاً للأسماك (ص 96):',
    options: [
      'المغرب، مصر، موريتانيا، اليمن، عُمان',
      'الأردن، العراق، سوريا، لبنان، فلسطين',
      'الجزائر، ليبيا، السودان، جزر القمر، البحرين',
      'تونس، الكويت، قطر، السعودية، جيبوتي'
    ],
    correctAnswer: 'المغرب، مصر، موريتانيا، اليمن، عُمان',
    explanation: 'وفق جدول أعلى 5 دول في ص 96 (إنتاج عربي كلي 3,041.7 ألف طن عام 2011م).',
    relatedLocationId: 'loc-morocco-fisheries'
  },
  {
    id: 'q-u4-5',
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    pageRef: 'ص 101',
    sourceLabel: 'الوحدة 4 · الدرس 3 · ص 101',
    type: 'fill_blank',
    cognitiveLevel: 'تذكر',
    prompt: 'ينتج الوطن العربي أكثر من .......% من الإنتاج العالمي للنفط ويُصدّر منه نحو 86%، كما ينتج أكثر من .......% من الغاز الطبيعي.',
    options: ['26 و13', '14 و5', '61 و39', '71 و29'],
    correctAnswer: '26 و13',
    explanation: 'نص ص 101: ينتج الوطن العربي >26% من النفط العالمي ويُصدّر 86% منه، وينتج >13% من الغاز الطبيعي.',
    relatedLocationId: 'loc-arabian-gulf-oil'
  },
  {
    id: 'q-u4-6',
    unitId: 'unit-4',
    lessonId: 'u4-l4',
    pageRef: 'ص 103 – 106',
    sourceLabel: 'الوحدة 4 · الدرس 4 · ص 104 – 105',
    type: 'guided_essay',
    cognitiveLevel: 'تحليل',
    prompt: 'ما مقومات التجارة في الوطن العربي، وما أهمية تكامل وسائل النقل الثلاثة (البري والبحري والجوي)؟',
    correctAnswer: 'مقومات التجارة الخمسة (ص 104): الموقع الاستراتيجي، تنوع الإنتاج الزراعي والصناعي، توفر النفط والمعادن، تطور النقل والمواصلات، واتساع الأسواق. وتكامل النقل يربط مناطق الإنتاج بالموانئ والمطارات والأسواق ويخفض كلفة التبادل البيني.',
    explanation: 'مبني على الدرس الرابع من الوحدة الرابعة (ص 104–106).',
    relatedLocationId: 'loc-suez-canal'
  },
  {
    id: 'q-u4-7',
    unitId: 'unit-4',
    lessonId: 'u4-l5',
    pageRef: 'ص 107 – 109',
    sourceLabel: 'الوحدة 4 · الدرس 5 · ص 107 – 109',
    type: 'matching',
    cognitiveLevel: 'تذكر',
    prompt: 'صل كل معلم سياحي عربي بالدولة التي يقع فيها (تقويم ص 109):',
    matchingPairs: [
      { left: 'مدينة البتراء', right: 'الأردن' },
      { left: 'أبو الهول والأهرامات', right: 'مصر' },
      { left: 'صنعاء القديمة وشبام حضرموت', right: 'الجمهورية اليمنية' },
      { left: 'القدس الشريف', right: 'فلسطين' }
    ],
    correctAnswer: 'مطابقة تامة',
    explanation: 'سؤال التوصيل بين المعالم والدول مستمد من تقويم الدرس الخامس ص 109.',
    relatedLocationId: 'loc-petra'
  },
  {
    id: 'q-u4-8',
    unitId: 'unit-4',
    lessonId: 'u4-l2',
    pageRef: 'ص 94، 110',
    sourceLabel: 'الوحدة 4 · تقويم الوحدة · ص 110',
    type: 'guided_essay',
    cognitiveLevel: 'تحليل',
    prompt: 'لماذا لا تتناسب كمية الإنتاج الزراعي في الوطن العربي مع اتساع مساحة الأراضي الصالحة للزراعة (2 مليون كم²)، وكيف نعالج الفجوة الغذائية؟',
    correctAnswer: 'بسبب تذبذب الأمطار والاعتماد الكبير على الزراعة البعلية، شح المياه، الزحف العمراني، ضعف الميكنة والتقنيات، وهجرة الأيدي العاملة الريفية. وتُعالج الفجوة الغذائية عبر التوسع الأفقي والرأسـي وتكامل الاستثمار الزراعي العربي وتحديث الري.',
    explanation: 'يجمع بين بطاقة التفكير (ص 97) وتقويم الوحدة الرابعة (ص 110).',
    relatedLocationId: 'loc-tigris-euphrates'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  ...CORE_TEXTBOOK_QUESTIONS.map((q) => ({ ...q, sourceCategory: 'textbook' as const })),
  ...MINISTERIAL_QUESTIONS,
  ...GENERATED_QUESTIONS
];

export {
  MINISTERIAL_QUESTIONS,
  MINISTERIAL_BATCH_STATS,
  MINISTERIAL_TOPIC_FREQUENCY,
  GENERATED_QUESTIONS
};

export const ERRATA_LOG: ErrataRecord[] = [
  {
    id: 'err-11',
    page: 11,
    unitId: 'unit-1',
    lessonId: 'u1-l1',
    category: 'وحدة قياس',
    originalInBook: '«تمتلك ساحلاً يبلغ طوله أكثر من 2200 كم²»',
    scientificClarification: 'الساحل طول وليس مساحة؛ الصواب العلمي: أكثر من 2200 كم.'
  },
  {
    id: 'err-19',
    page: 19,
    unitId: 'unit-1',
    lessonId: 'u1-l3',
    category: 'خريطة موضوعة في غير موضعها',
    originalInBook: 'وضع خريطة التضاريس (مكررة من ص 13) تحت عنوان الأقاليم المناخية في ص 19',
    scientificClarification: 'أُضيف في مدخل الأطلس طبقة أقاليم مناخية مخصصة لليمن مطابقة للنص الرسمي.'
  },
  {
    id: 'err-38',
    page: 38,
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    category: 'نقص بيانات إدارية',
    originalInBook: 'جدول نسب المحافظات يذكر 21 محافظة بدون إدراج محافظة أرخبيل سقطرى',
    scientificClarification: 'سقطرى أصبحت محافظة مستقلة نهاية 2013م وفق ص 30، وتُعرض الملاحظة عند قراءة الجدول.'
  },
  {
    id: 'err-39',
    page: 39,
    unitId: 'unit-2',
    lessonId: 'u2-l1',
    category: 'سقوط رقم مطبعي',
    originalInBook: 'في سؤال صح/خطأ (د): «يبلغ عدد سكان الجمهورية اليمنية حوالي مليون نسمة»',
    scientificClarification: 'سقط الرقم «28» قبل كلمة مليون؛ والعدد المقرر في ص 36 هو نحو 28 مليون نسمة.'
  },
  {
    id: 'err-41',
    page: 41,
    unitId: 'unit-2',
    lessonId: 'u2-l2',
    category: 'نقص في مجموع نسب الرسم الدائري',
    originalInBook: 'نسب القوى العاملة عام 2004م (53+19+8+6+5+3 = 94%)',
    scientificClarification: 'المجموع المطبوع 94% فقط بفارق 6% مع قدم تاريخ البيانات (2004م).'
  },
  {
    id: 'err-45',
    page: 45,
    unitId: 'unit-2',
    lessonId: 'u2-l3',
    category: 'خطأ مطبعي في كمية الإنتاج',
    originalInBook: '«حيث بلغت قدرة الإنتاج 30 مليون طن من القطن»',
    scientificClarification: 'رقم غير ممكن واقعياً (يفوق الإنتاج العالمي)، والمقصود غالباً 30 ألف طن أو أقل.'
  },
  {
    id: 'err-81',
    page: 81,
    unitId: 'unit-3',
    lessonId: 'u3-l4',
    category: 'خلل مقياس الرسم البياني',
    originalInBook: 'محور تحلية المياه يصل إلى 35.00 بينما عمود السعودية (2.23 مليار م³) مرسوم فوق 30.00',
    scientificClarification: 'تم تصحيح مقياس الرسم البياني في المختبر التفاعلي مع الحفاظ على الأرقام المكتوبة.'
  },
  {
    id: 'err-94',
    page: 94,
    unitId: 'unit-4',
    lessonId: 'u4-l2',
    category: 'فروق حسابية في جدول الفجوة الغذائية',
    originalInBook: 'نسبة اكتفاء اللحوم مطبوعة 81.2% (فجوة 1.6)، والألبان 70.9%',
    scientificClarification: 'الحساب الدقيق: اللحوم 70.7% (فجوة 1.7)، والألبان 7.8% (1 ÷ 12.8).'
  },
  {
    id: 'err-100',
    page: 100,
    unitId: 'unit-4',
    lessonId: 'u4-l3',
    category: 'فروق جمع في جدول الخامات المعدنية',
    originalInBook: 'إجمالي الرصاص 124.0 والحديد 19,885',
    scientificClarification: 'الجمع الدقيق لأرقام العمودين: الرصاص 124.5 والحديد 19,895.'
  },
  {
    id: 'err-106',
    page: 106,
    unitId: 'unit-4',
    lessonId: 'u4-l4',
    category: 'تكرار تحريري من دروس أخرى',
    originalInBook: 'النشاط الإثرائي يطلب خصائص السكان وبطاقة التفكير مكررة حرفياً من ص 102 (الصناعة)',
    scientificClarification: 'تم التنبيه إلى التكرار وتوجيه الأنشطة تفاعلياً لدرس التجارة والنقل.'
  }
];
