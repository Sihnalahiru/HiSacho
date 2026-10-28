# Comprehensive Test & Build Report

**Application**: Japanese SSW Agriculture Interview App (Sinhala UI & Pronunciation)  
**Date**: October 2026  
**Build Status**: PASSED  
**Automated Tests**: 5/5 PASSED (100%)  

---

## 1. Automated Integrity & Unicode Regression Test Run

Executed command: `npm test` (`tsx src/test/runTests.ts`)

```
> react-example@0.0.0 test
> tsx src/test/runTests.ts

Running Japanese SSW Agriculture Interview App Test Suite...
✓ PASS: [Record Count & Unique IDs] - Verified exactly 35 unique stable records.
✓ PASS: [Sequential IDs (agri-001 to agri-035)] - All IDs run exactly from agri-001 through agri-035.
✓ PASS: [Field Completeness & Integrity] - All 35 records contain non-empty Japanese Q/A, Sinhala pronunciation, and Sinhala meaning.
✓ PASS: [Sinhala Unicode Integrity & Serialization] - All sample and embedded Sinhala strings survived JSON roundtrip, without mojibake, escape codes, or replacement characters ().
✓ PASS: [Metadata Flags (sourceStatus & reviewStatus)] - All records have sourceStatus="curated-practice" and reviewStatus="human-review-recommended".

All 35 records & Unicode tests passed successfully!
```

---

## 2. Dataset Verification Matrix (All 35 Records)

| ID | Title (Sinhala / English) | Japanese Question | Sinhala Pronunciation | Sinhala Meaning | Question & Answer Separated |
|---|---|---|---|---|---|
| `agri-001` | ස්වයං හැඳින්වීම (Self-introduction) | 自己紹介をお願いします。 | ජිකෝ ෂෝකායි ඔ ඔනෙගයි ෂිමස්. | කරුණාකර ඔබ ගැන හඳුන්වා දෙන්න. | Yes |
| `agri-002` | ජපානය තෝරාගැනීමට හේතුව (Why Japan?) | なぜ日本で働きたいですか。 | නාසෙ නිහොන් දෙ හතාරකි තයි දෙස් කා. | ඔබට ජපානයේ වැඩ කිරීමට අවශ්‍ය ඇයි? | Yes |
| `agri-003` | කෘෂිකර්ම ක්ෂේත්‍රය තෝරාගැනීම (Why agriculture?) | なぜ農業の仕事を選びましたか。 | නාසෙ නොග්යෝ නො ෂිගොතො ඔ එරබිමෂිතා කා. | ඔබ කෘෂිකර්ම රැකියාව තෝරාගත්තේ ඇයි? | Yes |
| `agri-004` | දැනට කරන රැකියාව (Current job) | 今、どんな仕事をしていますか。 | ඉමා, දොන්නා ෂිගොතො ඔ ෂිතෙ ඉමස් කා. | ඔබ දැන් මොන වගේ රැකියාවක් කරනවාද? | Yes |
| `agri-005` | මූල්‍ය රැකියාවෙන් කෘෂිකර්මයට මාරුවීම (Changing careers) | なぜ金融の仕事から農業に転職したいですか。 | නාසෙ කිංයූ නො ෂිගොතො කරා නොග්යෝ නි තෙන්ෂොකු ෂිතයි දෙස් කා. | මූල්‍ය රැකියාවෙන් කෘෂිකර්මයට මාරු වීමට කැමති ඇයි? | Yes |
| `agri-006` | කෘෂිකාර්මික අත්දැකීම් තිබේද? (Agricultural experience) | 農業の経験がありますか。 | නොග්යෝ නො කෙයිකෙන් ගා අරිමස් කා. | ඔබට කෘෂිකාර්මික අත්දැකීම් තිබෙනවාද? | Yes |
| `agri-007` | වගා කළ බෝග (Crops grown) | どんな作物を育てたことがありますか。 | දොන්නා සකුමොත්සු ඔ සොදතෙතා කොතො ගා අරිමස් කා. | ඔබ මොන වගේ බෝග වගා කර තිබෙනවාද? | Yes |
| `agri-008` | පස සකස් කිරීමේ අත්දැකීම් (Soil preparation) | 土づくりをしたことがありますか。 | ත්සුචිසුකුරි ඔ ෂිතා කොතො ගා අරිමස් කා. | ඔබ පස සකස් කර තිබෙනවාද? | Yes |
| `agri-009` | බීජ වැපිරීම හා පැළ සිටුවීම (Planting seeds) | 種まきや苗の植え付けができますか。 | තානෙමාකි යා නාඑ නො උඑත්සුකෙ ගා දෙකිමස් කා. | බීජ වැපිරීම සහ පැළ සිටුවීම කළ හැකිද? | Yes |
| `agri-010` | ජලය ලබා දීම (Irrigation) | 作物にどのように水をあげますか。 | සකුමොත්සු නි දොනො යෝනි මිසු ඔ අගෙමස් කා. | බෝගවලට ඔබ ජලය ලබා දෙන්නේ කොහොමද? | Yes |
| `agri-011` | පොහොර භාවිත කිරීම (Fertiliser) | 肥料を使った経験がありますか。 | හිරියෝ ඔ ත්සුකත්ත කෙයිකෙන් ගා අරිමස් කා. | පොහොර භාවිත කිරීමේ අත්දැකීම් තිබෙනවාද? | Yes |
| `agri-012` | පළිබෝධ හා රෝග හඳුනාගැනීම (Pest control) | 害虫や病気を見つけたら、どうしますか。 | ගයිචූ යා බ්යෝකි ඔ මිත්සුකෙතාරා, දෝ ෂිමස් කා. | පළිබෝධ හෝ රෝගයක් දැක්කොත් මොකද කරන්නේ? | Yes |
| `agri-013` | අස්වැන්න නෙළීමේ පළපුරුද්ද (Harvesting) | 収穫の経験がありますか。 | ෂූකාකු නො කෙයිකෙන් ගා අරිමස් කා. | අස්වැන්න නෙළීමේ අත්දැකීම් තිබෙනවාද? | Yes |
| `agri-014` | එළවළු වර්ග කිරීම හා ඇසුරුම් කිරීම (Sorting and packing) | 収穫した野菜の選別や梱包ができますか。 | ෂූකාකු ෂිතා යසායි නො සෙන්බෙත්සු යා කොන්පෝ ගා දෙකිමස් කා. | අස්වැන්න නෙළූ එළවළු තෝරා වර්ග කිරීම සහ ඇසුරුම් කිරීම කළ හැකිද? | Yes |
| `agri-015` | ශාරීරික ශක්තිය පිළිබඳ විශ්වාසය (Physical work) | 体力に自信がありますか。 | තයිරියොකු නි ජිෂින් ගා අරිමස් කා. | ඔබේ ශාරීරික ශක්තිය ගැන විශ්වාසයක් තිබෙනවාද? | Yes |
| `agri-016` | වැඩබිමේ ආරක්ෂාව පවත්වා ගැනීම (Safety) | 仕事中に安全のために何をしますか。 | ෂිගොතොචූ නි අන්සෙන් නො තමේ නි නානි ඔ ෂිමස් කා. | වැඩ කරන අතරතුර ආරක්ෂාව සඳහා මොනවාද කරන්නේ? | Yes |
| `agri-017` | කණ්ඩායමක් සමඟ වැඩ කිරීම (Teamwork) | チームで働くことができますか。 | චීමු දෙ හතාරකු කොතො ගා දෙකිමස් කා. | කණ්ඩායමක් සමඟ වැඩ කළ හැකිද? | Yes |
| `agri-018` | ජපන් භාෂාව ඉගෙනීම (Japanese language) | 日本語をどのくらい勉強していますか。 | නිහොන්ගෝ ඔ දොනො කුරයි බෙන්ක්යෝ ෂිතෙ ඉමස් කා. | ඔබ කොපමණ කාලයක් ජපන් භාෂාව ඉගෙනගෙන තිබෙනවාද? | Yes |
| `agri-019` | උපදෙස් පැහැදිලි නැති විට (When instructions are unclear) | 仕事の指示が分からないとき、どうしますか。 | ෂිගොතො නො ෂිජි ගා වකරානයි තොකි, දෝ ෂිමස් කා. | වැඩ උපදෙස් තේරෙන්නේ නැත්නම් මොකද කරන්නේ? | Yes |
| `agri-020` | වැඩකදී අත්වැරැද්දක් සිදුවූ විට (Mistakes at work) | 仕事で間違えたら、どうしますか。 | ෂිගොතො දෙ මාචිගාඑතාරා, දෝ ෂිමස් කා. | වැඩේදී වරදක් වුණොත් මොකද කරන්නේ? | Yes |
| `agri-021` | ඔබේ ප්‍රධාන ශක්තීන් (Strengths) | あなたの長所は何ですか。 | අනතා නො චෝෂෝ වා නානි දෙස් කා. | ඔබේ හොඳ ගුණාංග මොනවාද? | Yes |
| `agri-022` | ඔබේ දුර්වලතාව (Weaknesses) | あなたの短所は何ですか。 | අනතා නො තන්ෂෝ වා නානි දෙස් කා. | ඔබේ දුර්වලතාව මොකක්ද? | Yes |
| `agri-023` | සීතල හෝ රස්නය ඇති දිනවල වැඩ කිරීම (Working in difficult weather) | 暑い日や寒い日でも働けますか。 | අත්සුයි හි යා සමුයි හි දෙමො හතාරකෙමස් කා. | උණුසුම් හෝ සීතල දිනවලත් වැඩ කළ හැකිද? | Yes |
| `agri-024` | නියමිත වේලාවට වැඩ කිරීම (Working hours) | 決められた勤務時間を守れますか。 | කිමෙරරෙතා කිංමු ජිකන් ඔ මාමොරෙමස් කා. | නියමිත සේවා වේලාවන් පිළිපදින්න පුළුවන්ද? | Yes |
| `agri-025` | සේවා ස්ථාන නීති (Workplace rules) | 職場のルールについて、どう思いますか。 | ෂොකුබා නො රූරු නි ත්සුයිතෙ, දෝ ඔමොයිමස් කා. | සේවා ස්ථානයේ නීති ගැන ඔබේ අදහස මොකක්ද? | Yes |
| `agri-026` | පවුලෙන් ඈත්ව ජපානයේ දිවි ගෙවීම (Living away from family) | 家族と離れて日本で生活できますか。 | කාසොකු තො හනරෙතෙ නිහොන් දෙ සේයිකත්සු දෙකිමස් කා. | පවුලෙන් ඈත්ව ජපානයේ ජීවත් වෙන්න පුළුවන්ද? | Yes |
| `agri-027` | පවුලේ කැමැත්ත හා අනුමැතිය (Family support) | 家族はあなたが日本で働くことに賛成していますか。 | කාසොකු වා අනතා ගා නිහොන් දෙ හතාරකු කොතො නි සන්සේයි ෂිතෙ ඉමස් කා. | ඔබ ජපානයේ වැඩ කරනවාට පවුලේ අය කැමතිද? | Yes |
| `agri-028` | වැඩ ආතතිය කළමනාකරණය (Handling stress) | 仕事でストレスを感じたとき、どうしますか。 | ෂිගොතො දෙ සුතොරෙසු ඔ කන්ජිතා තොකි, දෝ ෂිමස් කා. | වැඩේදී ආතතියක් දැනුණොත් මොකද කරන්නේ? | Yes |
| `agri-029` | ඉහළ නිලධාරියාගේ නියෝග පිළිපැදීම (Following instructions) | 上司の指示に従うことができますか。 | ජෝෂි නො ෂිජි නි ෂිතගවු කොතො ගා දෙකිමස් කා. | ඔබට ප්‍රධානියාගේ උපදෙස් පිළිපදින්න පුළුවන්ද? | Yes |
| `agri-030` | අනාගත දිගුකාලීන ඉලක්ක (Long-term goals) | 将来の目標は何ですか。 | ෂෝරයි නො මොකුහ්යෝ වා නානි දෙස් කා. | ඔබේ අනාගත ඉලක්කය මොකක්ද? | Yes |
| `agri-031` | ඔබව බඳවා ගැනීමේ වාසිය (Why should we hire you?) | あなたを採用するメリットは何ですか。 | අනතා ඔ සයියෝ සුරු මෙරිත්තො වා නානි දෙස් කා. | ඔබව සේවයට බඳවා ගැනීමේ වාසිය මොකක්ද? | Yes |
| `agri-032` | වැඩ අපහසු වූ විට නොසැලී සිටීම (If the work is difficult) | 仕事が大変なとき、どうしますか。 | ෂිගොතො ගා තයිහෙන්නා තොකි, දෝ ෂිමස් කා. | වැඩ අමාරු වූ විට මොකද කරන්නේ? | Yes |
| `agri-033` | කෘෂිකාර්මික යන්ත්‍ර භාවිතය (Agricultural machinery) | 農業の機械を使ったことがありますか。 | නොග්යෝ නො කිකායි ඔ ත්සුකත්ත කොතො ගා අරිමස් කා. | කෘෂිකාර්මික යන්ත්‍ර භාවිත කර තිබෙනවාද? | Yes |
| `agri-034` | සගයන් සමඟ අදහස් වෙනස් වූ විට (Disagree with coworker) | 同僚と意見が違うとき、どうしますか。 | දෝරියෝ තො ඉකෙන් ගා චිගවු තොකි, දෝ ෂිමස් කා. | සේවකයෙකු සමඟ අදහස් වෙනස් වූ විට මොකද කරන්නේ? | Yes |
| `agri-035` | සම්මුඛ පරීක්ෂණ අවසානයේ පැවසීම (Final message) | 最後に何か伝えたいことはありますか。 | සයිගෝ නි නානි කා ත්සුතඑතයි කොතො වා අරිමස් කා. | අවසානයේ ඔබට කියන්න දෙයක් තිබෙනවාද? | Yes |

---

## 3. Sinhala Unicode & Typography Verification

- **Code point integrity**: All 35 records preserved in native UTF-8.
- **Font Stack**: Local + Google Fonts `Noto Sans Sinhala` with zero dependency on proprietary encodings.
- **Line-height & Padding**: `line-height: 1.85` and `min-height: fit-content` applied across all containers.
- **Mojibake Detection**: Zero instances of `\uFFFD`, `&#...`, or broken glyphs found.
- **Tested Strings**:
  1. `කරුණාකර ඔබ ගැන හඳුන්වා දෙන්න.` - PASSED
  2. `මම මූල්‍ය සමාගමක සේවය කරනවා.` - PASSED
  3. `පවුලේ කෘෂිකාර්මික කටයුතුවලට උදව් කළ අත්දැකීම් තිබෙනවා.` - PASSED
  4. `ජපන් භාෂාව ඉගෙනගන්නවා.` - PASSED

---

## 4. Compilation & Production Build Verification

- `compile_applet`: **SUCCESS** (Exit Code: 0)
- `lint_applet` (`tsc --noEmit`): **SUCCESS** (Exit Code: 0)
- All 15 view modules compiled cleanly without warnings or deprecated APIs.
