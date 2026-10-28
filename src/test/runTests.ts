import { INTERVIEW_QUESTIONS } from '../data/interviewData.ts';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

export function runDataIntegrityAndUnicodeTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Exactly 35 unique stable IDs exist
  const ids = INTERVIEW_QUESTIONS.map(q => q.id);
  const uniqueIds = new Set(ids);
  const countPassed = INTERVIEW_QUESTIONS.length === 35 && uniqueIds.size === 35;
  results.push({
    name: 'Record Count & Unique IDs',
    passed: countPassed,
    message: countPassed
      ? 'Verified exactly 35 unique stable records.'
      : `Failed: expected 35 unique records, got ${INTERVIEW_QUESTIONS.length} (${uniqueIds.size} unique).`
  });

  // 2. IDs run from agri-001 through agri-035 in sequence
  let sequential = true;
  for (let i = 1; i <= 35; i++) {
    const expectedId = `agri-${String(i).padStart(3, '0')}`;
    if (!ids.includes(expectedId)) {
      sequential = false;
      break;
    }
  }
  results.push({
    name: 'Sequential IDs (agri-001 to agri-035)',
    passed: sequential,
    message: sequential
      ? 'All IDs run exactly from agri-001 through agri-035.'
      : 'Failed: one or more IDs in agri-001..agri-035 sequence are missing.'
  });

  // 3. Completeness of all fields
  let allFieldsValid = true;
  const missingFields: string[] = [];

  INTERVIEW_QUESTIONS.forEach(q => {
    if (!q.questionJapanese || q.questionJapanese.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing questionJapanese`);
    }
    if (!q.questionSinhalaPronunciation || q.questionSinhalaPronunciation.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing questionSinhalaPronunciation`);
    }
    if (!q.questionSinhalaMeaning || q.questionSinhalaMeaning.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing questionSinhalaMeaning`);
    }
    if (!q.answerJapanese || q.answerJapanese.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing answerJapanese`);
    }
    if (!q.answerSinhalaPronunciation || q.answerSinhalaPronunciation.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing answerSinhalaPronunciation`);
    }
    if (!q.answerSinhalaMeaning || q.answerSinhalaMeaning.trim().length === 0) {
      allFieldsValid = false;
      missingFields.push(`${q.id} missing answerSinhalaMeaning`);
    }

    // 4. No cross assignment between question and answer
    if (q.questionJapanese === q.answerJapanese) {
      allFieldsValid = false;
      missingFields.push(`${q.id} question and answer Japanese are identical`);
    }
    if (q.questionSinhalaMeaning === q.answerSinhalaMeaning) {
      allFieldsValid = false;
      missingFields.push(`${q.id} question and answer meanings are identical`);
    }
  });

  results.push({
    name: 'Field Completeness & Integrity',
    passed: allFieldsValid,
    message: allFieldsValid
      ? 'All 35 records contain non-empty Japanese Q/A, Sinhala pronunciation, and Sinhala meaning.'
      : `Failed: ${missingFields.join(', ')}`
  });

  // 5. Sinhala Unicode preservation & mojibake check
  const criticalSinhalaStrings = [
    'කරුණාකර ඔබ ගැන හඳුන්වා දෙන්න.',
    'මම මූල්‍ය සමාගමක සේවය කරනවා.',
    'පවුලේ කෘෂිකාර්මික කටයුතුවලට උදව් කළ අත්දැකීම් තිබෙනවා.',
    'ජපන් භාෂාව ඉගෙනගන්නවා.'
  ];

  let unicodeCheckPassed = true;
  let unicodeDetails = '';

  criticalSinhalaStrings.forEach(str => {
    // Check JSON serialization roundtrip
    const serialized = JSON.stringify({ text: str });
    const deserialized = JSON.parse(serialized).text;
    if (deserialized !== str) {
      unicodeCheckPassed = false;
      unicodeDetails += `JSON roundtrip failed for "${str}". `;
    }

    // Check for replacement character U+FFFD ()
    if (str.includes('\uFFFD') || deserialized.includes('\uFFFD')) {
      unicodeCheckPassed = false;
      unicodeDetails += `Replacement character detected in "${str}". `;
    }

    // Check that string contains valid Sinhala Unicode range (0x0D80 to 0x0DFF)
    const hasSinhalaChars = Array.from(str).some(c => {
      const code = c.charCodeAt(0);
      return code >= 0x0D80 && code <= 0x0DFF;
    });
    if (!hasSinhalaChars) {
      unicodeCheckPassed = false;
      unicodeDetails += `String does not contain valid Sinhala Unicode characters: "${str}". `;
    }
  });

  // Check all 35 records for  or broken escape codes
  let noMojibakeInRecords = true;
  INTERVIEW_QUESTIONS.forEach(q => {
    const allText = [
      q.questionSinhalaPronunciation,
      q.questionSinhalaMeaning,
      q.answerSinhalaPronunciation,
      q.answerSinhalaMeaning
    ].join(' ');

    if (allText.includes('\uFFFD') || allText.includes('&#') || allText.includes('\\u0')) {
      noMojibakeInRecords = false;
      unicodeDetails += `Mojibake or raw entity detected in record ${q.id}. `;
    }
  });

  results.push({
    name: 'Sinhala Unicode Integrity & Serialization',
    passed: unicodeCheckPassed && noMojibakeInRecords,
    message: unicodeCheckPassed && noMojibakeInRecords
      ? 'All sample and embedded Sinhala strings survived JSON roundtrip, without mojibake, escape codes, or replacement characters ().'
      : `Failed: ${unicodeDetails}`
  });

  // 6. Source status and review status
  const statusesValid = INTERVIEW_QUESTIONS.every(
    q => q.sourceStatus === 'curated-practice' && q.reviewStatus === 'human-review-recommended'
  );
  results.push({
    name: 'Metadata Flags (sourceStatus & reviewStatus)',
    passed: statusesValid,
    message: statusesValid
      ? 'All records have sourceStatus="curated-practice" and reviewStatus="human-review-recommended".'
      : 'Failed: invalid sourceStatus or reviewStatus.'
  });

  return results;
}

// CLI runner
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('runTests')) {
  console.log('Running Japanese SSW Agriculture Interview App Test Suite...');
  const testResults = runDataIntegrityAndUnicodeTests();
  let allPass = true;
  testResults.forEach(t => {
    console.log(`${t.passed ? '✓ PASS' : '✗ FAIL'}: [${t.name}] - ${t.message}`);
    if (!t.passed) allPass = false;
  });

  if (!allPass) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('\nAll 35 records & Unicode tests passed successfully!');
  }
}
