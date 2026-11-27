import {
  BOOK_FRONT_MATTER,
  CORE_TEXTBOOK_QUESTIONS,
  MINISTERIAL_QUESTIONS,
  TEXTBOOK_UNITS
} from '../data/bookIndex';
import { TEXTBOOK_MAP_TEMPLATES } from '../data/mapTemplatesData';
import {
  DISAMBIGUATION_ITEMS,
  MINISTERIAL_COMPARATIVE_TABLES
} from '../data/ministerialComparisons';
import { QuizQuestion, Unit } from '../types/textbook';
import type { BookletScope } from '../components/PrintableStudyBooklet';

const UNIT_MINDMAPS: Record<
  string,
  { title: string; steps: [string, string, string][] }
> = {
  'unit-1': {
    title: 'المخطط السببي للوحدة الأولى: البيئة الطبيعية لليمن (ص 8 – 32)',
    steps: [
      ['1. الموقع الاستراتيجي', 'ص 8–11', '12°–19°N على باب المندب والبحر الأحمر وبحر العرب · 154+ جزيرة (سقطرى، ميون، كمران).'],
      ['2. التضاريس الخمسة', 'ص 13–15', 'تهامة (من ساحل الشيخ سعيد) والسهل الجنوبي ← المرتفعات الغربية (الأوسط من صنعاء إلى الضالع، النبي شعيب 3670م) ← القيعان ← الهضاب المنحدرة شرقاً وشمالاً شرقياً ← الربع الخالي.'],
      ['3. المناخ والرياح', 'ص 17–19', 'مدار حار بالسهول ومعتدل بالمرتفعات (-1°م لكل 150م) · أمطار موسمية صيفية جنوبية غربية.'],
      ['4. الأودية والمياه', 'ص 24–28', 'أودية بأربعة اتجاهات (غرباً: حرض وحيران ومور ورماع وزبيد؛ جنوباً: تبن والرجاع وبنا وحضرموت؛ شرقاً: أذنة وبيحان وجردان؛ شمالاً: الجوف والخارد) + السدود (مأرب، كمران، مختان).'],
      ['5. النبات والمحميات الست', 'ص 26–32', 'تنوع نباتي حسب الارتفاع + 6 محميات طبيعية: سقطرى، حوف، عتمة، جبل برع، شرمة، جبل إراف.']
    ]
  },
  'unit-2': {
    title: 'المخطط السببي للوحدة الثانية: السكان والاقتصاد في اليمن (ص 36 – 56)',
    steps: [
      ['1. السكان والتركيب', 'ص 36–40', 'تركز بالمرتفعات المطيرة (تعز وإب) · مجتمع فتي (15–64 عاماً 50.9%، أقل من 15 عاماً 45.6%) · إعالة مرتفعة.'],
      ['2. الزراعة والبن والأسماك', 'ص 41–45', '4 أقاليم زراعية + 8 أصناف بن يمني مشهورة + ثروة سمكية بـ 102 ألف طن و94 ألف طن للماشية.'],
      ['3. المعادن والطاقة والصناعة', 'ص 46–49', 'نفط مأرب (صافر→رأس عيسى) والمسيلة (→الضبة) + ملح الصليف + 3 مصانع أسمنت (باجل، عمران، البرح).'],
      ['4. النقل والمطارات والموانئ', 'ص 50–52', '6 موانئ تجارية (عدن، الحديدة، المخا، الصليف، المكلا، نشطون) وميناءا النفط (رأس عيسى والضبة) + 7 مطارات دولية (صنعاء، عدن، تعز، الحديدة، الريان، سيئون، سقطرى).'],
      ['5. السياحة والمعالم الـ 19', 'ص 53–56', 'سياحة أثرية وتاريخية (صهاريج عدن، قلعة صيرة، براقش، شهارة) وساحلية (الغدير، أبين، الخوخة) وعلاجية (دمت، علي).']
    ]
  },
  'unit-3': {
    title: 'المخطط السببي للوحدة الثالثة: البيئة الطبيعية للوطن العربي (ص 60 – 84)',
    steps: [
      ['1. الموقع والمضائق الأربعة', 'ص 60–64', '22 دولة · 13.3 مليون كم² (71% أفريقيا، 29% آسيا) · جبل طارق، السويس، باب المندب، هرمز.'],
      ['2. التضاريس والأجنحة', 'ص 66–70', 'جبال التوائية (أطلس 4165م، عمان، كردستان) وانكسارية (الشام، البحر الأحمر) + هضبة أفريقيا وآسيا.'],
      ['3. المناخ والأقاليم الأربعة', 'ص 72–76', 'الإقليم الصحراوي (80%) + البحر المتوسط + المداري السافانا + الاستوائي جنوب السودان والصومال.'],
      ['4. الأنهار والبحيرات والسدود', 'ص 77–81', 'الأنهار (النيل، دجلة والفرات، شبيلي وجوبا) + بحيرات (ناصر، طبريا، المنزلة، البردويل، الحبانية، الثرثار، الأسد) + السد العالي وسد الفرات.'],
      ['5. الأمن المائي العربي', 'ص 82–84', 'أقل من 5% من المياه المتجددة عالمياً ← التوسع في تحلية المياه وترشيد الري.']
    ]
  },
  'unit-4': {
    title: 'المخطط السببي للوحدة الرابعة: السكان والاقتصاد في الوطن العربي (ص 88 – 110)',
    steps: [
      ['1. السكان والكثافة', 'ص 88–92', '419.78 مليون نسمة (61% أفريقيا، 39% آسيا) · نمو 24‰ · تركز بوادي النيل ودلتاه والسهول الساحلية.'],
      ['2. الزراعة والفجوة الغذائية', 'ص 93–96', 'فجوة غذائية رغم توفر الأراضي ← علاجها بالتوسع الأفقي (استصلاح) والرأسي (تحسين السلالات).'],
      ['3. الثروة المعدنية والنفط', 'ص 98–102', '>26% من إنتاج النفط العالمي و86% للتصدير · >13% غاز طبيعي · 50% فوسفات المغرب · حديد موريتانيا والجزائر.'],
      ['4. الصناعة والتجارة والموانئ', 'ص 103–106', 'صناعة استخراجية مقابل تحويلية · 7 مقومات و7 مشكلات صناعية · موانئ كبرى (جدة، الدار البيضاء، الإسكندرية، عدن).'],
      ['5. السياحة العربية الـ 16', 'ص 107–110', 'سياحة دينية (مكة، القدس) وتاريخية (الأهرامات، البتراء، تدمر، بابل، قرطاج) ومصايف وترفيه.']
    ]
  }
};

function escXml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wRun(
  text: string,
  opts?: { bold?: boolean; sizeHalf?: number; color?: string; italic?: boolean }
): string {
  const sizeHalf = opts?.sizeHalf ?? 22;
  const color = opts?.color ?? '0F172A';
  const b = opts?.bold ? '<w:b/><w:bCs/>' : '';
  const i = opts?.italic ? '<w:i/><w:iCs/>' : '';
  return (
    `<w:r><w:rPr>` +
    `<w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>` +
    `${b}${i}` +
    `<w:color w:val="${color}"/>` +
    `<w:sz w:val="${sizeHalf}"/><w:szCs w:val="${sizeHalf}"/>` +
    `<w:rtl/>` +
    `</w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r>`
  );
}

function wPara(
  runsXml: string,
  opts?: {
    align?: 'right' | 'center' | 'left';
    spaceBefore?: number;
    spaceAfter?: number;
    shading?: string;
    borderColor?: string;
    borderSide?: 'right' | 'bottom' | 'all';
    keepNext?: boolean;
  }
): string {
  const align = opts?.align ?? 'right';
  const jc = align === 'center' ? 'center' : align === 'left' ? 'left' : 'right';
  const before = opts?.spaceBefore ?? 80;
  const after = opts?.spaceAfter ?? 100;
  const parts = [
    '<w:bidi/>',
    `<w:jc w:val="${jc}"/>`,
    `<w:spacing w:before="${before}" w:after="${after}" w:line="320" w:lineRule="auto"/>`
  ];
  if (opts?.keepNext) parts.push('<w:keepNext/>');
  if (opts?.shading) parts.push(`<w:shd w:val="clear" w:color="auto" w:fill="${opts.shading}"/>`);
  if (opts?.borderColor) {
    const col = opts.borderColor;
    if (opts.borderSide === 'all') {
      parts.push(
        `<w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="${col}"/><w:left w:val="single" w:sz="6" w:space="8" w:color="${col}"/><w:bottom w:val="single" w:sz="6" w:space="6" w:color="${col}"/><w:right w:val="single" w:sz="6" w:space="8" w:color="${col}"/></w:pBdr>`
      );
    } else {
      const side = opts.borderSide ?? 'right';
      parts.push(`<w:pBdr><w:${side} w:val="single" w:sz="18" w:space="8" w:color="${col}"/></w:pBdr>`);
    }
  }
  return `<w:p><w:pPr>${parts.join('')}</w:pPr>${runsXml}</w:p>`;
}

function wPageBreak(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function wTable(
  headers: string[],
  rows: string[][],
  opts?: { headerBg?: string; headerFg?: string; borderCol?: string; stripeBg?: string }
): string {
  const headerBg = opts?.headerBg ?? '0F172A';
  const headerFg = opts?.headerFg ?? 'FFFFFF';
  const borderCol = opts?.borderCol ?? 'CBD5E1';
  const stripeBg = opts?.stripeBg ?? 'F8FAFC';

  const totalW = 9638;
  const ncols = Math.max(1, headers.length);
  const colW = Math.floor(totalW / ncols);
  const grid = Array.from({ length: ncols }, () => `<w:gridCol w:w="${colW}"/>`).join('');

  const tblPr =
    '<w:tblPr>' +
    '<w:tblW w:w="9638" type="dxa"/>' +
    '<w:bidiVisual/>' +
    '<w:tblBorders>' +
    `<w:top w:val="single" w:sz="6" w:space="0" w:color="${borderCol}"/>` +
    `<w:left w:val="single" w:sz="6" w:space="0" w:color="${borderCol}"/>` +
    `<w:bottom w:val="single" w:sz="6" w:space="0" w:color="${borderCol}"/>` +
    `<w:right w:val="single" w:sz="6" w:space="0" w:color="${borderCol}"/>` +
    `<w:insideH w:val="single" w:sz="4" w:space="0" w:color="${borderCol}"/>` +
    `<w:insideV w:val="single" w:sz="4" w:space="0" w:color="${borderCol}"/>` +
    '</w:tblBorders>' +
    '<w:tblCellMar>' +
    '<w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>' +
    '<w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>' +
    '</w:tblCellMar>' +
    '</w:tblPr>';

  const headerCells = headers
    .map(
      (h) =>
        `<w:tc><w:tcPr><w:tcW w:w="${colW}" type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${headerBg}"/></w:tcPr>` +
        wPara(wRun(h, { bold: true, sizeHalf: 20, color: headerFg }), {
          spaceBefore: 20,
          spaceAfter: 20
        }) +
        '</w:tc>'
    )
    .join('');

  const bodyRows = rows
    .map((row, idx) => {
      const bg = idx % 2 === 1 ? stripeBg : 'FFFFFF';
      const cells = Array.from({ length: ncols }, (_, cIdx) => {
        const val = row[cIdx] ?? '';
        return (
          `<w:tc><w:tcPr><w:tcW w:w="${colW}" type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${bg}"/></w:tcPr>` +
          wPara(wRun(val, { bold: cIdx === 0, sizeHalf: 19, color: '0F172A' }), {
            spaceBefore: 20,
            spaceAfter: 20
          }) +
          '</w:tc>'
        );
      }).join('');
      return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cells}</w:tr>`;
    })
    .join('');

  return `<w:tbl>${tblPr}<w:tblGrid>${grid}</w:tblGrid><w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${headerCells}</w:tr>${bodyRows}</w:tbl>`;
}

function selectUnitPaperQuestions(unitId: string): QuizQuestion[] {
  const ministerial = MINISTERIAL_QUESTIONS.filter((q) => q.unitId === unitId);
  const textbook = CORE_TEXTBOOK_QUESTIONS.filter((q) => q.unitId === unitId);
  const pool = [...ministerial, ...textbook].filter((q) => q.type !== 'map_identify');
  const seen = new Set<string>();
  const picked: QuizQuestion[] = [];
  for (const q of pool) {
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    picked.push(q);
    if (picked.length >= 6) break;
  }
  return picked;
}

// CRC32 + Minimal ZIP builder (uses deflate-raw when supported, STORE fallback otherwise)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

async function maybeDeflateRaw(raw: Uint8Array): Promise<{ method: number; data: Uint8Array }> {
  if (typeof CompressionStream === 'undefined') {
    return { method: 0, data: raw };
  }
  try {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    const copy = new Uint8Array(raw.length);
    copy.set(raw);
    void writer.write(copy).then(() => writer.close());
    const buf = await new Response(cs.readable).arrayBuffer();
    return { method: 8, data: new Uint8Array(buf) };
  } catch {
    return { method: 0, data: raw };
  }
}

async function buildZipArchive(files: { name: string; content: string }[]): Promise<Blob> {
  const enc = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const rawBytes = enc.encode(file.content);
    const crc = crc32(rawBytes);
    const { method, data } = await maybeDeflateRaw(rawBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // UTF-8 flag
    lv.setUint16(8, method, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x5421, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, rawBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, rawBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralSize = centralChunks.reduce((acc, c) => acc + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLen = offset + centralSize + eocd.length;
  const archive = new Uint8Array(totalLen);
  let pos = 0;
  for (const chunk of localChunks) {
    archive.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of centralChunks) {
    archive.set(chunk, pos);
    pos += chunk.length;
  }
  archive.set(eocd, pos);

  return new Blob([archive], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

export async function exportBookletAsWordDocx(scope: BookletScope = 'full'): Promise<void> {
  const unitsToRender: Unit[] =
    scope === 'full' || scope === 'maps-tables'
      ? TEXTBOOK_UNITS
      : TEXTBOOK_UNITS.filter((u) => u.id === scope);
  const mapsTablesOnly = scope === 'maps-tables';

  const body: string[] = [];

  const scopeHeadline =
    scope === 'full'
      ? 'الملزمة الشاملة الكاملة (الوحدات الأربع: ص 7 – 110)'
      : scope === 'maps-tables'
      ? 'كتيّب الخرائط والمقارنات المستقلة ومحاور التخيير الوزاري'
      : (() => {
          const found = TEXTBOOK_UNITS.find((u) => u.id === scope);
          return found ? `ملزمة الوحدة ${found.unitNumber}: ${found.title} (ص ${found.pageRange})` : 'الملزمة الشاملة';
        })();

  // Cover & Attribution
  body.push(
    wPara(
      wRun(
        `الجمهورية اليمنية · الصف التاسع الأساسي · المرجع الرسمي: ${BOOK_FRONT_MATTER.sourceEdition}`,
        { bold: true, sizeHalf: 20, color: '0369A1' }
      ),
      { align: 'center', spaceBefore: 60, spaceAfter: 60, shading: 'F0F9FF', borderColor: 'BAE6FD', borderSide: 'all' }
    )
  );
  body.push(
    wPara(
      wRun('الملزمة الشاملة الميسّرة في جغرافية الجمهورية اليمنية والوطن العربي', {
        bold: true,
        sizeHalf: 36,
        color: '0F172A'
      }),
      { align: 'center', spaceBefore: 140, spaceAfter: 60 }
    )
  );
  body.push(
    wPara(
      wRun(scopeHeadline, { bold: true, sizeHalf: 24, color: '92400E' }),
      { align: 'center', spaceBefore: 20, spaceAfter: 60 }
    )
  );
  body.push(
    wPara(
      wRun(
        'نسخة وورد مُفككة ومركّزة مدعّمة بجداول الخرائط التوضيحية والصماء والمقارنات المستقلة وأسئلة الوزارة وإجاباتها النموذجية.',
        { sizeHalf: 21, color: '475569' }
      ),
      { align: 'center', spaceBefore: 10, spaceAfter: 160 }
    )
  );

  body.push(
    wTable(
      ['إعداد وتصميم المحتوى', 'المراجعة والتدقيق العلمي والمنهجي'],
      [
        [
          'الأستاذ إبراهيم أحمد متاش — للتواصل والدعم التربوي والتقني: 779424090',
          'الأستاذ مجدي محمد النوفاني — مراجع المحتوى التعليمي والجغرافي للكتاب التفاعلي والملزمة'
        ]
      ],
      { headerBg: '1E293B', borderCol: '94A3B8' }
    )
  );

  // Table of Contents
  body.push(
    wPara(
      wRun('فهرس محتويات الملزمة وخريطة المذاكرة الورقية', {
        bold: true,
        sizeHalf: 26,
        color: '0F172A'
      }),
      { spaceBefore: 180, spaceAfter: 80, borderColor: '0284C7', borderSide: 'bottom', keepNext: true }
    )
  );

  const tocRows = unitsToRender.map((u) => {
    const uMaps = TEXTBOOK_MAP_TEMPLATES.filter((m) => m.unitId === u.id);
    const uTables = MINISTERIAL_COMPARATIVE_TABLES.filter((t) => t.unitId === u.id);
    const lessonsSummary = mapsTablesOnly
      ? 'تركيز على الخرائط وجداول المقارنات'
      : u.lessons.map((l) => `(${l.lessonNumber}) ${l.title} (ص ${l.pageRange})`).join(' · ');
    return [
      `الوحدة ${u.unitNumber}: ${u.title} (ص ${u.pageRange})`,
      lessonsSummary,
      `${uMaps.length} خرائط + ${uTables.length} جداول`
    ];
  });
  body.push(
    wTable(['الوحدة', 'الدروس المشمولة وأرقام الصفحات', 'الخرائط والمقارنات'], tocRows, {
      headerBg: '0369A1'
    })
  );

  let qCounter = 1;
  const allPaperQuestions: { number: number; unitNumber: number; question: QuizQuestion }[] = [];
  if (!mapsTablesOnly) {
    for (const u of unitsToRender) {
      for (const q of selectUnitPaperQuestions(u.id)) {
        allPaperQuestions.push({ number: qCounter++, unitNumber: u.unitNumber, question: q });
      }
    }
  }

  for (const unit of unitsToRender) {
    body.push(wPageBreak());
    const semLabel =
      unit.semester === 1
        ? 'الفصل الدراسي الأول (الجمهورية اليمنية)'
        : 'الفصل الدراسي الثاني (الوطن العربي)';
    body.push(
      wPara(
        wRun(`${semLabel} · الكتاب ص ${unit.pageRange}\n`, {
          bold: true,
          sizeHalf: 20,
          color: 'BAE6FD'
        }) +
          wRun(`الوحدة ${unit.unitNumber}: ${unit.title}`, {
            bold: true,
            sizeHalf: 32,
            color: 'FFFFFF'
          }),
        { spaceBefore: 60, spaceAfter: 120, shading: '0F172A', borderColor: '0284C7', borderSide: 'all' }
      )
    );

    for (const obj of unit.objectives.slice(0, 4)) {
      body.push(
        wPara(wRun(`• ${obj}`, { sizeHalf: 20, color: '334155' }), { spaceBefore: 20, spaceAfter: 30 })
      );
    }

    if (!mapsTablesOnly) {
      for (const lesson of unit.lessons) {
        body.push(
          wPara(
            wRun(`الدرس ${lesson.lessonNumber}: ${lesson.title} `, {
              bold: true,
              sizeHalf: 26,
              color: '0F172A'
            }) + wRun(`(الكتاب ص ${lesson.pageRange})`, { bold: true, sizeHalf: 20, color: '0369A1' }),
            { spaceBefore: 160, spaceAfter: 60, shading: 'F1F5F9', borderColor: '0284C7', borderSide: 'right', keepNext: true }
          )
        );

        if (lesson.keyFacts.length > 0) {
          body.push(
            wPara(
              wRun('الأرقام والمؤشرات القياسية للدرس:', { bold: true, sizeHalf: 21, color: '075985' }),
              { spaceBefore: 60, spaceAfter: 30, keepNext: true }
            )
          );
          body.push(
            wTable(
              ['المؤشر / المعطى', 'القيمة الرسمية', 'الصفحة'],
              lesson.keyFacts.map((kf) => [kf.label, kf.value, kf.pageRef]),
              { headerBg: '0284C7' }
            )
          );
        }

        for (const sec of lesson.sections) {
          body.push(
            wPara(
              wRun(`▸ ${sec.title} `, { bold: true, sizeHalf: 23, color: '0F172A' }) +
                wRun(`(${sec.pageRef})`, { sizeHalf: 19, color: '64748B' }),
              { spaceBefore: 100, spaceAfter: 40, keepNext: true }
            )
          );
          for (const p of sec.paragraphs) {
            body.push(wPara(wRun(p, { sizeHalf: 21, color: '1E293B' }), { spaceBefore: 20, spaceAfter: 50 }));
          }
          for (const b of sec.bullets ?? []) {
            body.push(wPara(wRun(`– ${b}`, { sizeHalf: 20, color: '334155' }), { spaceBefore: 15, spaceAfter: 30 }));
          }
          for (const tbl of sec.tables ?? []) {
            body.push(
              wPara(
                wRun(`جدول: ${tbl.title} (${tbl.pageRef})`, { bold: true, sizeHalf: 20, color: '0F172A' }),
                { spaceBefore: 80, spaceAfter: 30, keepNext: true }
              )
            );
            body.push(wTable(tbl.headers, tbl.rows, { headerBg: '334155' }));
          }
          for (const fm of sec.formulas ?? []) {
            const ex = fm.exampleValue ? ` — المؤشر الرسمي: ${fm.exampleValue}` : '';
            body.push(
              wPara(
                wRun(`قانون: ${fm.name}: `, { bold: true, sizeHalf: 20, color: '3730A3' }) +
                  wRun(fm.expression, { bold: true, sizeHalf: 20, color: '0F172A' }) +
                  wRun(ex, { sizeHalf: 20, color: '475569' }),
                { spaceBefore: 50, spaceAfter: 60, shading: 'EEF2FF', borderColor: '6366F1', borderSide: 'right' }
              )
            );
          }
        }

        if (lesson.concepts.length > 0) {
          body.push(
            wPara(
              wRun('المفاهيم والمصطلحات المقررة:', { bold: true, sizeHalf: 21, color: '065F46' }),
              { spaceBefore: 80, spaceAfter: 30, keepNext: true }
            )
          );
          body.push(
            wTable(
              ['المصطلح', 'التعريف المعتمد في الكتاب (مع تمييز الإثراء)', 'الصفحة'],
              lesson.concepts.map((c) => [
                c.term,
                c.enrichmentNote ? `${c.definition} — [إثراء: ${c.enrichmentNote}]` : c.definition,
                c.pageRef
              ]),
              { headerBg: '047857' }
            )
          );
        }
      }
    }

    const unitMaps = TEXTBOOK_MAP_TEMPLATES.filter((m) => m.unitId === unit.id);
    if (unitMaps.length > 0) {
      body.push(
        wPara(
          wRun(`خرائط الوحدة ${unit.unitNumber} ودليل المواضع والتدريب الورقي (${unitMaps.length} خرائط)`, {
            bold: true,
            sizeHalf: 26,
            color: '0C4A6E'
          }),
          { spaceBefore: 180, spaceAfter: 80, borderColor: '0284C7', borderSide: 'bottom', keepNext: true }
        )
      );
      for (const mp of unitMaps) {
        body.push(
          wPara(
            wRun(`${mp.title} (${mp.bookMapRef})`, { bold: true, sizeHalf: 22, color: '0F172A' }),
            { spaceBefore: 100, spaceAfter: 30, keepNext: true }
          )
        );
        body.push(
          wPara(wRun(mp.description, { sizeHalf: 20, color: '475569' }), {
            spaceBefore: 10,
            spaceAfter: 40
          })
        );
        body.push(
          wTable(
            ['#', 'المعلم على الخريطة', 'التصنيف', 'الدلالة المنهجية'],
            mp.features.map((feat, idx) => [String(idx + 1), feat.label, feat.category, feat.detail]),
            { headerBg: '0369A1' }
          )
        );
        body.push(
          wPara(
            wRun('تمرين الخريطة الصماء للتسميع بالقلم:', { bold: true, sizeHalf: 20, color: '334155' }),
            { spaceBefore: 60, spaceAfter: 20, keepNext: true }
          )
        );
        body.push(
          wTable(
            ['الرقم', 'اكتب اسم المعلم هنا', 'التصنيف المساعد'],
            mp.features.map((feat, idx) => [String(idx + 1), '................................................', feat.category]),
            { headerBg: '475569' }
          )
        );
      }
    }

    const unitTables = MINISTERIAL_COMPARATIVE_TABLES.filter((t) => t.unitId === unit.id);
    if (unitTables.length > 0) {
      body.push(
        wPara(
          wRun(`جداول المقارنات المستقلة للوحدة ${unit.unitNumber} (${unitTables.length} جداول)`, {
            bold: true,
            sizeHalf: 26,
            color: '92400E'
          }),
          { spaceBefore: 180, spaceAfter: 80, borderColor: 'D97706', borderSide: 'bottom', keepNext: true }
        )
      );
      for (const ct of unitTables) {
        body.push(
          wPara(
            wRun(`${ct.title} `, { bold: true, sizeHalf: 22, color: '0F172A' }) +
              wRun(`(${ct.pageRef} · وزاري: ${ct.ministerialSlots})`, { sizeHalf: 19, color: 'B45309' }),
            { spaceBefore: 100, spaceAfter: 30, keepNext: true }
          )
        );
        body.push(wTable(ct.headers, ct.rows, { headerBg: 'B45309' }));
        body.push(
          wPara(
            wRun('مفتاح التركيز الوزاري: ', { bold: true, sizeHalf: 20, color: '78350F' }) +
              wRun(ct.focusTip, { sizeHalf: 20, color: '1E293B' }),
            { spaceBefore: 30, spaceAfter: 80, shading: 'FFFBEB' }
          )
        );
      }
    }

    const unitDisambigs = DISAMBIGUATION_ITEMS.filter((d) => d.unitId === unit.id);
    if (unitDisambigs.length > 0) {
      body.push(
        wPara(
          wRun(`احذر الخلط الوزاري: التخيير والتمييز بين المتشابهات (${unitDisambigs.length} محاور)`, {
            bold: true,
            sizeHalf: 25,
            color: '312E81'
          }),
          { spaceBefore: 160, spaceAfter: 60, borderColor: '4F46E5', borderSide: 'bottom', keepNext: true }
        )
      );
      body.push(
        wTable(
          ['محور التمييز', 'سبب التشابه', 'الفرق الفاصل الحاسم'],
          unitDisambigs.map((d) => [d.title, d.similarityReason, d.decisiveDifference]),
          { headerBg: '4338CA' }
        )
      );
    }

    const mm = UNIT_MINDMAPS[unit.id];
    if (mm) {
      body.push(
        wPara(wRun(mm.title, { bold: true, sizeHalf: 24, color: '0F172A' }), {
          spaceBefore: 160,
          spaceAfter: 50,
          keepNext: true
        })
      );
      body.push(wTable(['الحلقة السببية', 'الصفحات', 'الخلاصة المركّزة'], mm.steps, { headerBg: '1E293B' }));
    }

    const unitQs = allPaperQuestions.filter((item) => item.unitNumber === unit.unitNumber);
    if (unitQs.length > 0) {
      body.push(
        wPara(
          wRun(`أسئلة المراجعة الوزارية للوحدة ${unit.unitNumber} (أجب قبل الرجوع للملحق)`, {
            bold: true,
            sizeHalf: 24,
            color: '065F46'
          }),
          { spaceBefore: 160, spaceAfter: 60, keepNext: true }
        )
      );
      for (const item of unitQs) {
        const q = item.question;
        const src = q.sourceCategory === 'ministerial' ? 'سؤال وزاري' : 'تقويم الكتاب';
        body.push(
          wPara(
            wRun(`س${item.number}. ${q.prompt} `, { bold: true, sizeHalf: 21, color: '0F172A' }) +
              wRun(`(${src} · ${q.pageRef})`, { sizeHalf: 18, color: '64748B' }),
            { spaceBefore: 60, spaceAfter: 25 }
          )
        );
        if (q.options && q.options.length > 0) {
          body.push(
            wPara(
              wRun(q.options.map((o) => `(  ) ${o}`).join('    |    '), {
                sizeHalf: 20,
                color: '334155'
              }),
              { spaceBefore: 10, spaceAfter: 40 }
            )
          );
        }
      }
    }
  }

  // Answer Key Appendix
  const includedMaps = TEXTBOOK_MAP_TEMPLATES.filter((m) =>
    unitsToRender.some((u) => u.id === m.unitId)
  );
  body.push(wPageBreak());
  body.push(
    wPara(
      wRun('الملحق الختامي: مفاتيح الإجابات النموذجية والخرائط الصماء', {
        bold: true,
        sizeHalf: 30,
        color: '065F46'
      }),
      { spaceBefore: 60, spaceAfter: 100, borderColor: '059669', borderSide: 'bottom', keepNext: true }
    )
  );

  if (allPaperQuestions.length > 0) {
    body.push(
      wPara(wRun('أولاً: إجابات أسئلة المراجعة الوزارية:', { bold: true, sizeHalf: 22, color: '0F172A' }), {
        spaceBefore: 80,
        spaceAfter: 40,
        keepNext: true
      })
    );
    body.push(
      wTable(
        ['السؤال', 'الوحدة', 'الإجابة الصحيحة', 'التعليل والصفحة'],
        allPaperQuestions.map((item) => [
          `س${item.number}`,
          `و${item.unitNumber}`,
          item.question.correctAnswer,
          `${item.question.explanation} (${item.question.pageRef})`
        ]),
        { headerBg: '065F46' }
      )
    );
  }

  if (includedMaps.length > 0) {
    body.push(
      wPara(
        wRun(`ثانياً: مفاتيح أرقام الخرائط الصماء (${includedMaps.length} خرائط):`, {
          bold: true,
          sizeHalf: 22,
          color: '0F172A'
        }),
        { spaceBefore: 160, spaceAfter: 40, keepNext: true }
      )
    );
    body.push(
      wTable(
        ['الخريطة', 'مفاتيح الأرقام'],
        includedMaps.map((mp) => [
          mp.title,
          mp.features.map((feat, idx) => `${idx + 1}. ${feat.label.split('(')[0].trim()}`).join('  ·  ')
        ]),
        { headerBg: '0369A1' }
      )
    );
  }

  body.push(
    wPara(
      wRun('تمت بحمد الله الملزمة الشاملة الميسّرة — جغرافية الصف التاسع الأساسي (طبعة 2026)\n', {
        bold: true,
        sizeHalf: 22,
        color: '0F172A'
      }) +
        wRun('إعداد: الأستاذ إبراهيم أحمد متاش (هاتف: 779424090)  ·  مراجعة وتدقيق: الأستاذ مجدي محمد النوفاني', {
          bold: true,
          sizeHalf: 20,
          color: '0369A1'
        }),
      { align: 'center', spaceBefore: 180, spaceAfter: 60, shading: 'F1F5F9', borderColor: '94A3B8', borderSide: 'all' }
    )
  );

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" mc:Ignorable="w14 wp14">` +
    `<w:body>${body.join('')}` +
    `<w:sectPr><w:headerReference w:type="default" r:id="rId1"/><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/><w:bidi/></w:sectPr>` +
    `</w:body></w:document>`;

  const headerXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:hdr xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word">` +
    `<w:p><w:pPr><w:bidi/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:noProof/></w:rPr><w:pict>` +
    `<v:shapetype id="_x0000_t136" coordsize="21600,21600" o:spt="136" adj="10800" path="m@7,l@8,m@5,21600l@6,21600e"><v:formulas><v:f eqn="sum #0 0 10800"/><v:f eqn="prod #0 2 1"/><v:f eqn="sum 21600 0 @1"/><v:f eqn="sum 0 0 @2"/><v:f eqn="sum 21600 0 @3"/><v:f eqn="if @0 @3 0"/><v:f eqn="if @0 21600 @1"/><v:f eqn="if @0 0 @2"/><v:f eqn="if @0 @4 21600"/><v:f eqn="mid @5 @6"/><v:f eqn="mid @8 @5"/><v:f eqn="mid @7 @8"/><v:f eqn="mid @6 @7"/><v:f eqn="sum @6 0 @5"/></v:formulas><v:path textpathok="t" o:connecttype="custom" o:connectlocs="@9,0;@10,10800;@11,21600;@12,10800" o:connectangles="270,180,90,0"/><v:textpath on="t" fitshape="t"/><v:handles><v:h position="#0,bottomRight" xrange="6629,14971"/></v:handles><o:lock v:ext="edit" text="t" shapetype="t"/></v:shapetype>` +
    `<v:shape id="PowerPlusWaterMarkObject1" o:spid="_x0000_s2049" type="#_x0000_t136" style="position:absolute;margin-left:0;margin-top:0;width:460pt;height:140pt;rotation:330;z-index:-251657216;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin" o:allowincell="f" fillcolor="#94a3b8" stroked="f"><v:fill opacity="0.16"/><v:textpath style="font-family:'Cairo';font-size:24pt;font-weight:bold" string="إعداد: أ. إبراهيم أحمد متاش  —  مراجعة: أ. مجدي محمد النوفاني"/></v:shape>` +
    `</w:pict></w:r></w:p></w:hdr>`;

  const footerXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:bidi/><w:jc w:val="center"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/></w:pBdr></w:pPr>` +
    `<w:r><w:rPr><w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/><w:sz w:val="17"/><w:szCs w:val="17"/><w:color w:val="64748B"/><w:rtl/></w:rPr><w:t xml:space="preserve">ملزمة جغرافية الصف التاسع (طبعة 2026) · إعداد: أ. إبراهيم أحمد متاش · مراجعة: أ. مجدي محمد النوفاني · صفحة </w:t></w:r>` +
    `<w:r><w:fldSimple w:instr="PAGE"/></w:r>` +
    `<w:r><w:rPr><w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/><w:sz w:val="17"/><w:szCs w:val="17"/><w:color w:val="64748B"/><w:rtl/></w:rPr><w:t xml:space="preserve"> من </w:t></w:r>` +
    `<w:r><w:fldSimple w:instr="NUMPAGES"/></w:r></w:p></w:ftr>`;

  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>` +
    `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>` +
    `<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>` +
    `</Types>`;

  const relsRootXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const docRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>` +
    `</Relationships>`;

  const stylesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="ar-YE" w:bidi="ar-YE"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:bidi/></w:pPr></w:style></w:styles>`;

  const settingsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:themeFontLang w:val="ar-YE" w:bidi="ar-YE"/></w:settings>`;

  const blob = await buildZipArchive([
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: relsRootXml },
    { name: 'word/_rels/document.xml.rels', content: docRelsXml },
    { name: 'word/document.xml', content: documentXml },
    { name: 'word/header1.xml', content: headerXml },
    { name: 'word/footer1.xml', content: footerXml },
    { name: 'word/styles.xml', content: stylesXml },
    { name: 'word/settings.xml', content: settingsXml }
  ]);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    scope === 'full'
      ? 'الملزمة_الشاملة_جغرافيا_تاسع_2026.docx'
      : `ملزمة_جغرافيا_تاسع_${scope}_2026.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
