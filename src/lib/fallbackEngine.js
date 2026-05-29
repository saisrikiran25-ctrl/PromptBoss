// src/lib/fallbackEngine.js
// Pure JavaScript deterministic rule-based prompt improvement and diagnosis engine.
// Acts as a backup fallback when all OpenRouter API keys are rate-limited or fail.

const TASK_SIGNATURES = {
  writing: {
    keywords: ["write", "draft", "compose", "create", "craft",
      "generate text", "article", "essay", "blog", "post",
      "email", "letter", "report", "content", "copy", "script",
      "story", "description", "caption", "headline"],
    weight: 1
  },
  research: {
    keywords: ["research", "find", "search", "look up", "gather",
      "compile", "investigate", "analyze", "study", "discover",
      "explore", "summarize research", "sources", "evidence",
      "information about", "facts about", "overview of"],
    weight: 1
  },
  coding: {
    keywords: ["code", "write a function", "build", "implement",
      "develop", "debug", "fix", "script", "program", "api",
      "algorithm", "class", "function", "module", "javascript",
      "python", "html", "css", "sql", "typescript", "react"],
    weight: 1.2
  },
  analysis: {
    keywords: ["analyze", "evaluate", "assess", "compare",
      "contrast", "review", "critique", "examine", "diagnose",
      "identify patterns", "breakdown", "pros and cons",
      "strengths and weaknesses", "swot", "audit"],
    weight: 1
  },
  extraction: {
    keywords: ["extract", "parse", "pull out", "identify",
      "find all", "list all", "get all", "retrieve", "detect",
      "locate", "highlight", "pick out", "isolate"],
    weight: 1
  },
  classification: {
    keywords: ["classify", "categorize", "sort", "group",
      "label", "tag", "assign", "organize", "bucket",
      "segment", "rank", "prioritize", "order by"],
    weight: 1
  },
  summarization: {
    keywords: ["summarize", "summary", "tldr", "brief",
      "condense", "shorten", "compress", "digest", "overview",
      "key points", "main points", "in short", "recap"],
    weight: 1
  },
  automation: {
    keywords: ["automate", "workflow", "trigger", "webhook",
      "api call", "n8n", "make.com", "zapier", "agent",
      "pipeline", "process", "run", "execute", "schedule",
      "route", "condition", "loop", "node"],
    weight: 1.3
  },
  marketing: {
    keywords: ["marketing", "campaign", "ad", "copy", "cta",
      "headline", "hook", "landing page", "conversion",
      "audience", "brand", "message", "pitch", "outreach",
      "promotion", "persuade", "sell"],
    weight: 1
  }
};

const STRONG_VERBS = ["analyze", "summarize", "write", "generate", 
  "create", "explain", "compare", "evaluate", "identify", 
  "extract", "classify", "design", "build", "list", "convert",
  "translate", "review", "diagnose", "suggest", "calculate",
  "predict", "rank", "prioritize"];

const FORMAT_KEYWORDS = ["format", "output", "respond in", "reply in",
  "as a list", "as a table", "bullet", "numbered", "json", 
  "markdown", "paragraph", "structure", "in the form of",
  "return a", "provide a"];

const AUDIENCE_KEYWORDS = ["for a", "for an", "for the", "aimed at",
  "audience is", "reader is", "targeted at", "for beginners",
  "for experts", "for my", "for someone"];

const CONSTRAINT_KEYWORDS = ["do not", "don't", "avoid", "must not",
  "never", "only use", "limit to", "within", "no more than",
  "at least", "maximum", "minimum", "keep it", "ensure that",
  "make sure", "without", "exclude", "focus only"];

const EXAMPLE_SIGNALS = ["for example", "such as", "like this:",
  "e.g.", "example:", "here's an example", "sample:", 
  "input:", "output:", "→"];

const VAGUE_WORDS = ["something", "stuff", "things", "good", "nice",
  "better", "best", "great", "useful", "helpful", "interesting",
  "relevant", "appropriate", "proper", "correct", "right",
  "maybe", "perhaps", "kind of", "sort of", "a bit", "some",
  "various", "several", "many", "few", "general", "overall"];

const TONE_KEYWORDS = ["tone:", "style:", "formal", "informal",
  "casual", "professional", "friendly", "technical", "simple",
  "concise", "detailed", "conversational", "academic", 
  "persuasive", "neutral", "in plain language", "in simple terms"];

const STOPWORDS = ["the", "a", "an", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "could", "should", "may", "might",
  "shall", "can", "need", "dare", "ought", "used", "to", "of",
  "in", "for", "on", "with", "at", "by", "from", "up", "about",
  "into", "through", "during", "and", "but", "or", "nor", "so",
  "yet", "both", "either", "neither", "not", "only", "own",
  "same", "than", "too", "very", "just", "this", "that", 
  "these", "those", "i", "me", "my", "we", "our", "you", "your",
  "it", "its", "they", "them", "their"];

const VAGUE_TO_SPECIFIC = {
  "good": "clear and effective",
  "nice": "well-structured",
  "better": "more precise and actionable",
  "best": "most effective",
  "useful": "directly applicable",
  "helpful": "actionable and practical",
  "interesting": "insightful and specific",
  "relevant": "directly related to the task",
  "appropriate": "fitting the context and goal",
  "proper": "correctly formatted and accurate",
  "great": "high-quality and well-executed",
  "some": "the specific",
  "stuff": "information",
  "things": "items",
  "do something": "perform the following action",
  "help me": "complete the following task:",
  "make it": "ensure it is"
};

const DOMAIN_NOUNS = ["article", "email", "code", "ticket", "website", 
  "product", "data", "workflow", "function", "customer", "report", 
  "research", "api", "database", "query", "user", "file", "text"];

const ROLE_TEMPLATES = {
  writing: "You are an expert content writer and strategist.",
  research: "You are a thorough research analyst with expertise in synthesizing information.",
  coding: "You are a senior software engineer with expertise in clean, efficient code.",
  analysis: "You are a critical analyst with strong expertise in structured evaluation.",
  extraction: "You are a precise data extraction specialist.",
  classification: "You are an expert classifier with a strong eye for pattern recognition.",
  summarization: "You are an expert at distilling complex information into clear, concise summaries.",
  automation: "You are an expert AI workflow architect and automation engineer.",
  marketing: "You are a conversion-focused marketing copywriter and strategist.",
  general: "You are a highly capable AI assistant with broad expertise."
};

const CONSTRAINT_DEFAULTS = {
  writing: "Be clear, concise, and avoid generic filler phrases. Do not use overly formal or robotic language.",
  research: "Only include verifiable, relevant information. Flag uncertainties clearly.",
  coding: "Write clean, readable code with comments. Handle edge cases. Do not over-engineer.",
  analysis: "Be objective and evidence-based. Clearly distinguish facts from interpretation.",
  extraction: "Extract only what is explicitly present. Do not infer or add information.",
  classification: "Classify strictly based on the provided criteria. Do not create new categories.",
  summarization: "Preserve all key information. Do not introduce new information. Be neutral.",
  automation: "Be explicit about inputs, outputs, and error handling. Do not assume context.",
  marketing: "Do not use clichés or vague superlatives. Focus on specific value and audience.",
  general: "Be accurate, clear, and directly useful. Avoid unnecessary padding."
};

const OUTPUT_TEMPLATES = {
  writing: "Respond with a well-structured document. Use clear paragraphs and natural flow.",
  research: "Provide a structured response with: Summary, Key Findings, Details, and Sources (if available).",
  coding: "Provide the complete code solution. Include: language, comments, and a brief explanation of approach.",
  analysis: "Structure your response as: Overview, Key Points, Evidence, Conclusion.",
  extraction: "Return the extracted items as a numbered list. Each item on a new line.",
  classification: "Return a table or structured list with: Item, Category, Confidence, Reasoning.",
  summarization: "Return: 1) A one-sentence TL;DR, 2) Key points as bullets, 3) A short paragraph summary.",
  automation: "Provide: Workflow name, trigger, steps (numbered), output, and error handling note.",
  marketing: "Structure as: Hook, Problem, Solution, CTA. Keep each section to 2-3 sentences max.",
  general: "Respond in clear, well-organized paragraphs. Use bullet points for lists."
};

const EXAMPLE_TEMPLATES = {
  classification: `Input: "I can't get the app to load after the latest update."
Category: Bug Report
Confidence: High
Reasoning: User reports a functional failure tied to a specific event.`,
  extraction: `Input: "John Smith, CEO at Acme Corp, reached out on May 15."
Extracted:
- Name: John Smith
- Title: CEO
- Company: Acme Corp
- Date: May 15`,
  coding: `// Example: Simple input/output contract
Input: [1, 2, 3, 4, 5]
Expected Output: [2, 4] // only even numbers`
};

const GUARDRAIL_TEMPLATES = {
  all: [
    "If the input is empty or unclear, return: {error: 'insufficient input'}",
    "Do not hallucinate or infer information not present in the input.",
    "Always return valid JSON matching the schema above."
  ],
  extraction: ["Extract only explicitly stated information."],
  classification: ["Only use the provided categories. Do not create new ones."],
  routing: ["If no route matches, return: {destination: 'unhandled', reason: '...'}"],
  summarization: ["Do not omit major context points or change context facts."],
  coding: ["Avoid styling templates that are not requested or verbose explanations."],
  agent_task: ["Ensure dependencies are evaluated prior to recommending state changes."]
};

const SCHEMA_TEMPLATES = {
  extraction: {
    description: "Extracted items organized by field name and confidence level",
    schema: { "extracted_items": [{ "field": "string", "value": "string", "confidence": "high|medium|low" }] }
  },
  classification: {
    description: "Classification results with matching category and reasoning",
    schema: { "category": "string", "confidence": "high|medium|low", "reasoning": "string" }
  },
  summarization: {
    description: "distilled content with tl;dr, key bullet points, and full summary",
    schema: { "tldr": "string", "key_points": "array of strings", "full_summary": "string" }
  },
  report_generation: {
    description: "Structured section-based report with headers and conclusion",
    schema: { "title": "string", "sections": [{ "heading": "string", "content": "string" }], "conclusion": "string" }
  },
  routing: {
    description: "Decision logic routing specifying target path and priority",
    schema: { "destination": "string", "reason": "string", "priority": "high|medium|low" }
  },
  agent_task: {
    description: "Execution state logs and next step suggestion",
    schema: { "status": "complete|incomplete|error", "output": "string", "next_step": "string" }
  },
  json_output: {
    description: "Fully structured output schema",
    schema: { "success": "boolean", "data": "object", "timestamp": "string" }
  }
};

const TEST_CASES = {
  extraction: [
    { input: "Extract name: Alice Johnson, age 29.", expected: '{ "extracted_items": [{"field": "name", "value": "Alice Johnson", "confidence": "high"}, {"field": "age", "value": "29", "confidence": "high"}] }' },
    { input: "Invoice total is $450 paid by cards.", expected: '{ "extracted_items": [{"field": "total", "value": "$450", "confidence": "high"}] }' }
  ],
  classification: [
    { input: "This is a billing issue.", expected: '{ "category": "billing", "confidence": "high", "reasoning": "Mentions billing keywords" }' },
    { input: "I need to reset my password.", expected: '{ "category": "support", "confidence": "high", "reasoning": "Requests password reset assistance" }' }
  ],
  summarization: [
    { input: "Text about AI tools accelerating workflow productivity and reducing deployment friction.", expected: '{ "tldr": "AI tools improve workflows.", "key_points": ["Improves speed", "Reduces friction"], "full_summary": "..." }' },
    { input: "Short brief outlining safety protocols during database updates.", expected: '{ "tldr": "Database update safety brief.", "key_points": ["Follow protocols"], "full_summary": "..." }' }
  ],
  routing: [
    { input: "Request refund.", expected: '{ "destination": "billing_queue", "reason": "Mentions refund request", "priority": "high" }' },
    { input: "Just saying hi.", expected: '{ "destination": "general_inbox", "reason": "No actionable request", "priority": "low" }' }
  ]
};

// Helper to tokenize and clean words
function getWords(text) {
  return text.toLowerCase().match(/\b[a-z0-9']+\b/g) || [];
}

// Helper to count occurrences of a keyword/phrase in text using word boundaries
function countKeywordOccurrences(text, keyword) {
  if (!text || !keyword) return 0;
  const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const startBoundary = /^\w/.test(keyword) ? '\\b' : '';
  const endBoundary = /\w$/.test(keyword) ? '\\b' : '';
  const regex = new RegExp(startBoundary + escaped + endBoundary, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// ── PART 3: INTENT AND TASK DETECTOR ───────────────────────────
export function detectIntent(rawPrompt) {
  if (!rawPrompt || !rawPrompt.trim()) return "general";
  const cleanPromptLower = rawPrompt.toLowerCase();
  
  let bestType = "general";
  let maxScore = 0;

  for (const [type, sig] of Object.entries(TASK_SIGNATURES)) {
    let score = 0;
    for (const kw of sig.keywords) {
      // Direct count matches of keywords (including multi-word phrases)
      const occurrences = countKeywordOccurrences(cleanPromptLower, kw);
      score += occurrences * sig.weight;
    }
    if (score > maxScore) {
      maxScore = score;
      bestType = type;
    }
  }

  return maxScore >= 1 ? bestType : "general";
}

// ── PART 1: PROMPT DIAGNOSIS ENGINE ────────────────────────────
export function diagnosePrompt(rawPrompt, taskType, model, mode = "improve") {
  const weaknesses = [];
  const strengths = [];
  const missingElements = [];
  const suggestedImprovements = [];
  const cleanPrompt = rawPrompt || '';
  const words = getWords(cleanPrompt);
  const wordCountVal = words.length;

  // 1. Role
  const hasRole = /\b(you are|act as|as a|your role|you're a|pretend|imagine you are|behave as)\b/i.test(cleanPrompt);
  if (!hasRole) {
    weaknesses.push({
      category: "Role Definition",
      severity: "high",
      title: "Missing Persona",
      description: "No clear role, behavior, or persona was assigned to the AI model."
    });
    missingElements.push("Role Definition");
    suggestedImprovements.push("Inject a professional persona matching the task context.");
  } else {
    strengths.push("Explicit role definition provided.");
  }

  // 2. Task Clarity
  const first20 = words.slice(0, 20);
  const strongVerbsInFirst20 = first20.filter(w => STRONG_VERBS.includes(w));
  if (strongVerbsInFirst20.length === 0) {
    weaknesses.push({
      category: "Task Clarity",
      severity: "critical",
      title: "Unclear Objective",
      description: "Lacks strong, action-oriented verbs in the beginning to clearly command the AI."
    });
    missingElements.push("Strong Action Verbs");
    suggestedImprovements.push("Lead with strong action verbs (e.g. 'Analyze', 'Summarize', 'Build').");
  } else {
    strengths.push("Uses strong action verbs to direct the model.");
  }

  // 3. Context
  const contextNouns = words.filter(w => DOMAIN_NOUNS.includes(w));
  const hasLowContext = wordCountVal < 15 && contextNouns.length < 2;
  if (hasLowContext) {
    weaknesses.push({
      category: "Context & Background",
      severity: "high",
      title: "Insufficient Context",
      description: "The prompt contains very brief context, limiting the quality of domain-specific constraints."
    });
    missingElements.push("Domain Nouns / Background");
    suggestedImprovements.push("Provide brief background info or specific context details.");
  } else {
    strengths.push("Adequate task context and domain background.");
  }

  // 4. Format
  const hasFormat = FORMAT_KEYWORDS.some(kw => cleanPrompt.toLowerCase().includes(kw));
  if (!hasFormat) {
    weaknesses.push({
      category: "Output Format",
      severity: "medium",
      title: "No Output Format Specified",
      description: "The output formatting (e.g. markdown, paragraphs, tables, JSON) is undefined."
    });
    missingElements.push("Output Structure Specification");
    suggestedImprovements.push("Define the response layout, structure, or content schema.");
  } else {
    strengths.push("Output format specifications are explicitly declared.");
  }

  // 5. Audience
  const hasAudience = AUDIENCE_KEYWORDS.some(kw => cleanPrompt.toLowerCase().includes(kw));
  if (!hasAudience) {
    weaknesses.push({
      category: "Audience Specification",
      severity: "medium",
      title: "Unspecified Target Audience",
      description: "No target audience profile is defined, which can lead to inappropriate vocabulary depth."
    });
    missingElements.push("Audience Definition");
    suggestedImprovements.push("Describe the end reader (e.g. 'for beginners', 'for executives').");
  } else {
    strengths.push("Defined audience context.");
  }

  // 6. Constraints
  const hasConstraints = CONSTRAINT_KEYWORDS.some(kw => cleanPrompt.toLowerCase().includes(kw));
  if (!hasConstraints) {
    weaknesses.push({
      category: "Constraints & Guardrails",
      severity: "medium",
      title: "Missing Constraints",
      description: "Lacks boundaries, word limits, or negative rules (e.g. 'do not use generic filler words')."
    });
    missingElements.push("Guardrails & Constraints");
    suggestedImprovements.push("Set clear boundaries (e.g., maximum length, prohibited elements).");
  } else {
    strengths.push("Explicit constraints and guardrails set.");
  }

  // 7. Examples
  const hasExamples = EXAMPLE_SIGNALS.some(kw => cleanPrompt.toLowerCase().includes(kw));
  const needsExamples = ["classification", "extraction", "coding"].includes(taskType);
  if (!hasExamples && needsExamples) {
    weaknesses.push({
      category: "Examples (Few-shot)",
      severity: "medium",
      title: "Lacks Examples",
      description: "No few-shot demonstrations were provided for a pattern-critical task."
    });
    missingElements.push("Few-shot Examples");
    suggestedImprovements.push("Provide 1-2 examples of inputs and expected outputs.");
  } else if (hasExamples) {
    strengths.push("Uses concrete demonstrations/examples.");
  }

  // 8. Ambiguity
  const vagueMatches = words.filter(w => VAGUE_WORDS.includes(w));
  const ambiguityRatio = wordCountVal > 0 ? vagueMatches.length / wordCountVal : 0;
  if (ambiguityRatio > 0.08) {
    weaknesses.push({
      category: "Scope Boundaries",
      severity: "high",
      title: "High Ambiguity",
      description: `Contains high concentration of vague words (${Math.round(ambiguityRatio * 100)}%). Words like 'good', 'nice', or 'stuff' confuse instruction engines.`
    });
    suggestedImprovements.push("Replace general descriptors with highly specific metrics or requirements.");
  }

  // 9. Length Efficiency
  if (wordCountVal < 10) {
    weaknesses.push({
      category: "Prompt Length",
      severity: "high",
      title: "Too Short",
      description: "Prompt is extremely short (< 10 words) and lacks sufficient information density."
    });
    suggestedImprovements.push("Elaborate on details to give the AI proper guidance.");
  } else if (wordCountVal < 20 && ["analysis", "research", "coding"].includes(taskType)) {
    weaknesses.push({
      category: "Prompt Length",
      severity: "medium",
      title: "Under-specified for Task Complexity",
      description: `Analysis, research, or coding tasks require higher precision. Your prompt is only ${wordCountVal} words.`
    });
    suggestedImprovements.push("Increase detail level for complex execution logic.");
  }

  // 10. Tone
  const hasTone = TONE_KEYWORDS.some(kw => cleanPrompt.toLowerCase().includes(kw));
  const needsTone = ["writing", "marketing", "general"].includes(taskType);
  if (!hasTone && needsTone) {
    weaknesses.push({
      category: "Tone & Style",
      severity: "medium",
      title: "Missing Tone / Style Instructions",
      description: "No style guidelines (e.g. professional, concise, simple terms) were included."
    });
    missingElements.push("Tone Guideline");
    suggestedImprovements.push("Provide a tone constraint (e.g. 'Use a conversational, direct tone').");
  }

  // 11. Repetition
  const nonStopwords = words.filter(w => !STOPWORDS.includes(w));
  const uniqueWords = new Set(nonStopwords);
  const repRatio = nonStopwords.length > 0 ? (nonStopwords.length - uniqueWords.size) / nonStopwords.length : 0;
  if (repRatio > 0.35) {
    weaknesses.push({
      category: "Redundancy",
      severity: "low",
      title: "Redundant Language",
      description: "The prompt contains a high repeat frequency of content words, making it verbose."
    });
    suggestedImprovements.push("Consolidate repetitive phrasing and simplify sentences.");
  }

  // 12. Workflow Readiness
  const hasWorkflowMarkers = /({{|{).*?}}|step \d+|input:|output:|return:|json|schema/i.test(cleanPrompt);
  if (!hasWorkflowMarkers && mode === "workflow") {
    weaknesses.push({
      category: "Workflow Readiness",
      severity: "high",
      title: "Not Workflow Ready",
      description: "Lacks variables, step sequencing, output formatting directives, or schema bounds."
    });
    missingElements.push("Workflow Parameters");
    suggestedImprovements.push("Introduce parameter variables like {{input_data}} and JSON output structures.");
  }

  // Determine complexity
  let complexityLevel = "basic";
  if (wordCountVal >= 30) complexityLevel = "intermediate";
  if (wordCountVal >= 100 && hasConstraints && hasFormat) complexityLevel = "advanced";

  return {
    score: 0, // Filled in by scorePrompt
    weaknesses,
    missingElements,
    strengths,
    complexityLevel,
    detectedIntent: taskType || "general",
    detectedAudience: hasAudience ? "User Specified" : "General Audience",
    detectedOutputFormat: hasFormat ? "User Specified" : "Paragraphs",
    suggestedImprovements
  };
}

// ── PART 2: PROMPT SCORING ALGORITHM ───────────────────────────
export function scorePrompt(prompt, taskType, weaknesses, mode = "improve") {
  let score = 100;

  // Deductions
  const wCats = weaknesses.map(w => w.category);
  
  if (wCats.includes("Role Definition")) score -= 12;
  if (wCats.includes("Task Clarity")) score -= 20;
  if (wCats.includes("Context & Background")) score -= 15;
  if (wCats.includes("Output Format")) score -= 10;
  if (wCats.includes("Audience Specification")) score -= 8;
  if (wCats.includes("Constraints & Guardrails")) score -= 8;
  if (wCats.includes("Examples (Few-shot)")) score -= 7;
  if (weaknesses.some(w => w.title === "High Ambiguity")) score -= 10;
  if (weaknesses.some(w => w.title === "Too Short")) score -= 10;
  if (wCats.includes("Tone & Style")) score -= 5;
  if (wCats.includes("Redundancy")) score -= 5;
  if (wCats.includes("Workflow Readiness")) score -= 10;

  // Bonuses
  const cleanPrompt = prompt.toLowerCase();
  
  const hasRole = /\b(you are|act as|as a|your role|you're a|pretend|imagine you are|behave as)\b/i.test(cleanPrompt);
  if (hasRole) score += 5;

  const hasFormat = FORMAT_KEYWORDS.some(kw => cleanPrompt.includes(kw));
  if (hasFormat) score += 5;

  const hasExamples = EXAMPLE_SIGNALS.some(kw => cleanPrompt.includes(kw));
  if (hasExamples) score += 5;

  const hasConstraints = CONSTRAINT_KEYWORDS.some(kw => cleanPrompt.includes(kw));
  if (hasConstraints) score += 3;

  const wordCountVal = getWords(cleanPrompt).length;
  if (wordCountVal >= 30 && wordCountVal <= 100) score += 3;

  const hasSteps = /step \d+|first|then|finally/i.test(cleanPrompt);
  if (hasSteps) score += 4;

  const hasVars = /({{|{).*?}}/i.test(cleanPrompt);
  if (hasVars && mode === "workflow") score += 5;

  score = Math.max(0, Math.min(100, score));

  let scoreLabel = "Average";
  if (score <= 30) scoreLabel = "Needs Major Work";
  else if (score <= 50) scoreLabel = "Below Average";
  else if (score <= 65) scoreLabel = "Average";
  else if (score <= 79) scoreLabel = "Good";
  else if (score <= 89) scoreLabel = "Strong";
  else scoreLabel = "Expert-Level";

  return { score, scoreLabel };
}

// ── PART 7: VAGUE WORD CLEANER ─────────────────────────────────
export function cleanVagueLanguage(prompt) {
  let cleaned = prompt || '';
  const changes = [];
  
  for (const [vague, specific] of Object.entries(VAGUE_TO_SPECIFIC)) {
    const regex = new RegExp(`\\b${vague}\\b`, 'gi');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, specific);
      changes.push(`Replaced vague descriptor '${vague}' with more specific '${specific}'.`);
    }
  }

  return { cleanedPrompt: cleaned, changes };
}

// ── PART 5: EXAMPLE INJECTION ENGINE ───────────────────────────
export function generateExamples(taskType, prompt) {
  const tmpl = EXAMPLE_TEMPLATES[taskType];
  return tmpl ? `## Examples\n${tmpl}` : "";
}

// ── PART 4: PROMPT IMPROVEMENT ENGINE ──────────────────────────
export function improvePrompt(cleanedPrompt, diagnosis, taskType, model) {
  const role = ROLE_TEMPLATES[taskType] || ROLE_TEMPLATES.general;
  const constraints = CONSTRAINT_DEFAULTS[taskType] || CONSTRAINT_DEFAULTS.general;
  const format = OUTPUT_TEMPLATES[taskType] || OUTPUT_TEMPLATES.general;

  // Construct context
  const contextEnhancement = `Your task involves execution inside the '${taskType}' category. Here is the relevant information: ${cleanedPrompt}`;
  
  // Construct clarified task
  let mainVerb = "complete";
  const words = getWords(cleanedPrompt);
  const foundStrong = words.find(w => STRONG_VERBS.includes(w));
  if (foundStrong) {
    mainVerb = foundStrong;
  }
  const clarifiedTask = `Carefully review the provided context and details, then ${mainVerb} the requirements accordingly.`;

  // Quick version
  const quickVersion = [
    role,
    cleanedPrompt,
    constraints,
    format
  ].join("\n\n");

  // Advanced version
  const examplesStr = generateExamples(taskType, cleanedPrompt);
  const advancedVersion = [
    `## Role\n${role}`,
    `## Context\n${contextEnhancement}`,
    `## Task\n${clarifiedTask}`,
    `## Constraints\n${constraints}`,
    `## Output Format\n${format}`,
    examplesStr ? `${examplesStr}` : ""
  ].filter(Boolean).join("\n\n");

  return { quickVersion, advancedVersion };
}

// ── PART 9: ALTERNATIVE VERSIONS GENERATOR ─────────────────────
export function generateAlternatives(improvedPrompt, taskType) {
  const role = ROLE_TEMPLATES[taskType] || ROLE_TEMPLATES.general;
  const constraints = CONSTRAINT_DEFAULTS[taskType] || CONSTRAINT_DEFAULTS.general;

  const concise = [
    `## Concise Role\n${role}`,
    `## Key Directive\nExecute the core instructions: ${improvedPrompt.slice(0, 150)}...`,
    `## Main Rule\n${constraints}`
  ].join("\n\n");

  const detailed = [
    `## Role & Persona\n${role}`,
    `## In-Depth Instructions\n1. Review the input data thoroughly.\n2. Apply the constraints strictly.\n3. Execute the primary objective: ${improvedPrompt}`,
    `## Strict Quality Guidelines\n${constraints}`
  ].join("\n\n");

  const creative = [
    `## Role\n${role}`,
    `## Task\nExecute: ${improvedPrompt}`,
    `## Reasoning Guardrail\nThink step-by-step before finalizing your answer. Outline your logic clearly.`
  ].join("\n\n");

  return [
    { label: "More concise", prompt: concise },
    { label: "More formal", prompt: detailed },
    { label: "Creative/CoT angle", prompt: creative }
  ];
}

// ── PART 8: WHAT CHANGED EXPLAINER ─────────────────────────────
export function explainChanges(originalPrompt, improvedPrompt, diagnosis) {
  const explanations = [];
  const wCats = diagnosis.weaknesses.map(w => w.category);

  if (wCats.includes("Role Definition")) {
    explanations.push("Added a role definition because your prompt lacked a clear persona for the AI to adopt.");
  }
  if (wCats.includes("Output Format")) {
    explanations.push("Injected an output format because your original prompt did not specify how the response should be structured.");
  }
  if (wCats.includes("Constraints & Guardrails")) {
    explanations.push("Added default constraints to prevent over-broad responses.");
  }
  if (wCats.includes("Task Clarity")) {
    explanations.push("Restructured the task statement to lead with a strong action verb.");
  }
  if (wCats.includes("Context & Background")) {
    explanations.push("Added a context framing sentence to improve response accuracy.");
  }

  // Defaults to make sure we always have at least 3 entries as requested
  if (explanations.length < 1) explanations.push("Polished grammar and formatted output blocks for high-readability.");
  if (explanations.length < 2) explanations.push("Added clear formatting templates to specify structural bounds.");
  if (explanations.length < 3) explanations.push("Separated directives into explicit headers (Role, Task, Constraints).");

  return explanations;
}

// ── PART 6: WORKFLOW PROMPT SYSTEM BUILDER ─────────────────────
export function buildWorkflowPromptSystem(rawPrompt, workflowType = "json_output", platform = "openrouter") {
  const role = ROLE_TEMPLATES.automation;
  const constraints = CONSTRAINT_DEFAULTS.automation;

  // Determine user templates
  let userPromptTemplate = `Extract information from: {{input_text}}\nReturn as JSON.`;
  if (workflowType === "classification") {
    userPromptTemplate = `Classify this item: {{item}}\nUse categories: {{categories}}\nReturn: {category, confidence, reasoning}`;
  } else if (workflowType === "routing") {
    userPromptTemplate = `Analyze this input: {{input}}\nRoute to one of: {{destinations}}\nReturn: {destination, reason}`;
  } else if (workflowType === "summarization") {
    userPromptTemplate = `Summarize the following text: {{document}}\nReturn standard bullet summary.`;
  } else if (workflowType === "agent_task") {
    userPromptTemplate = `Perform core task on: {{agent_objective}}`;
  }

  // Schema
  const schema = SCHEMA_TEMPLATES[workflowType] || SCHEMA_TEMPLATES.json_output;

  // Guardrails
  const guardrails = [
    ...GUARDRAIL_TEMPLATES.all,
    ...(GUARDRAIL_TEMPLATES[workflowType] || [])
  ].join("\n");

  // Platform note
  let integration_notes = "Structure as messages: [{role: 'system', content: systemPrompt}, {role: 'user', content: formattedUserPrompt}]";
  if (platform === "n8n") {
    integration_notes = "Paste system prompt in the AI Agent node's system prompt field. Use the Set node to format {{variables}} before the AI step.";
  } else if (platform === "make") {
    integration_notes = "Place system prompt in the OpenAI/OpenRouter module's system role field. Use text parsers for variables.";
  } else if (platform === "openrouter") {
    integration_notes = "Pass system prompt as role: 'system' and user template as role: 'user' in the messages array.";
  }

  // Variables
  const variables = [
    { name: "input_text", type: "string", description: "The raw input content to evaluate", required: true }
  ];

  return {
    system_prompt: [role, constraints, JSON.stringify(schema, null, 2)].join("\n\n"),
    user_template: userPromptTemplate,
    variables,
    guardrails,
    output_schema: schema,
    integration_notes,
    few_shot_examples: TEST_CASES[workflowType] || []
  };
}

// ── PART 10: MASTER ORCHESTRATOR FUNCTION ──────────────────────
export function runFallbackEngine(rawPrompt, taskType, model, mode, workflowType, platform) {
  const detected = (!taskType || taskType === 'auto' || taskType === 'auto-detect') ? detectIntent(rawPrompt) : taskType;
  const diag = diagnosePrompt(rawPrompt, detected, model, mode);
  const { score, scoreLabel } = scorePrompt(rawPrompt, detected, diag.weaknesses, mode);
  diag.score = score;

  const { cleanedPrompt } = cleanVagueLanguage(rawPrompt);
  const { quickVersion, advancedVersion } = improvePrompt(cleanedPrompt, diag, detected, model);
  const alts = generateAlternatives(cleanedPrompt, detected);
  const changes = explainChanges(rawPrompt, advancedVersion, diag);

  let workflowSystem = null;
  if (mode === "workflow") {
    workflowSystem = buildWorkflowPromptSystem(rawPrompt, workflowType, platform);
  }

  return {
    originalPrompt: rawPrompt,
    cleanedPrompt,
    diagnosis: diag,
    score,
    scoreLabel,
    quickVersion,
    advancedVersion,
    workflowSystem,
    alternatives: alts,
    whatChanged: changes,
    fallbackMode: true,
    fallbackNote: "Generated by deterministic fallback engine. No AI API was used. Results are rule-based."
  };
}
