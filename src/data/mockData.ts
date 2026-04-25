// ── Mock Data for SkillSwap Demo (no backend needed) ──────────────────────────

export const SKILLS = [
  { _id: 's1', name: 'JavaScript', category: 'Programming', icon: '⚡', description: 'Web development with JS' },
  { _id: 's2', name: 'Python', category: 'Programming', icon: '🐍', description: 'Python programming basics to advanced' },
  { _id: 's3', name: 'React', category: 'Programming', icon: '⚛️', description: 'Build modern UIs with React' },
  { _id: 's4', name: 'Data Structures', category: 'Programming', icon: '🏗️', description: 'DSA fundamentals' },
  { _id: 's5', name: 'Graphic Design', category: 'Design', icon: '🎨', description: 'Visual design principles' },
  { _id: 's6', name: 'UI/UX Design', category: 'Design', icon: '📐', description: 'User interface design' },
  { _id: 's7', name: 'Spanish Language', category: 'Language', icon: '🇪🇸', description: 'Conversational Spanish' },
  { _id: 's8', name: 'Mathematics', category: 'Academic', icon: '📊', description: 'Calculus, algebra, and more' },
  { _id: 's9', name: 'Physics', category: 'Academic', icon: '⚡', description: 'Physics fundamentals' },
  { _id: 's10', name: 'Guitar', category: 'Music', icon: '🎸', description: 'Guitar basics and beyond' },
  { _id: 's11', name: 'Photography', category: 'Creative', icon: '📷', description: 'Photography techniques' },
  { _id: 's12', name: 'Public Speaking', category: 'Soft Skills', icon: '🎤', description: 'Presentation skills' },
];

export const CATEGORIES = ['All', 'Programming', 'Design', 'Language', 'Academic', 'Music', 'Creative', 'Soft Skills'];

export const EXAMS: Record<string, any> = {
  s1: {
    _id: 'e1', skill: { _id: 's1', name: 'JavaScript' }, examType: 'mixed',
    difficulty: 'intermediate', minScorePercent: 60, maxAttempts: 3, timeLimitMins: 30, attemptCount: 0,
    questions: [
      { _id: 'q1', questionType: 'mcq', questionText: 'What does typeof null return?', optionA: '"null"', optionB: '"object"', optionC: '"undefined"', optionD: '"boolean"', answerKey: 'B', marks: 1 },
      { _id: 'q2', questionType: 'mcq', questionText: 'Which method removes the last element of an array?', optionA: 'shift()', optionB: 'pop()', optionC: 'splice()', optionD: 'slice()', answerKey: 'B', marks: 1 },
      { _id: 'q3', questionType: 'mcq', questionText: 'What is a closure in JavaScript?', optionA: 'A CSS property', optionB: 'A function with access to its outer scope', optionC: 'A type of loop', optionD: 'A data type', answerKey: 'B', marks: 1 },
      { _id: 'q4', questionType: 'mcq', questionText: 'What does === check?', optionA: 'Value only', optionB: 'Type only', optionC: 'Value and type', optionD: 'Reference only', answerKey: 'C', marks: 1 },
      { _id: 'q5', questionType: 'mcq', questionText: 'Which is NOT a primitive type?', optionA: 'string', optionB: 'number', optionC: 'object', optionD: 'boolean', answerKey: 'C', marks: 1 },
      { _id: 'q6', questionType: 'coding', questionText: 'Write a function that reverses a string.', language: 'javascript', starterCode: 'function solve(input) {\n  // reverse the string\n}', marks: 3, testCases: [{ input: 'hello', expectedOutput: 'olleh' }, { input: 'world', expectedOutput: 'dlrow' }], totalTestCases: 3 },
    ],
  },
  s2: {
    _id: 'e2', skill: { _id: 's2', name: 'Python' }, examType: 'mcq',
    difficulty: 'intermediate', minScorePercent: 60, maxAttempts: 3, timeLimitMins: 25, attemptCount: 0,
    questions: [
      { _id: 'q7', questionType: 'mcq', questionText: "What is the output of print(type([]))?", optionA: "<class 'list'>", optionB: "<class 'array'>", optionC: "<class 'tuple'>", optionD: "<class 'dict'>", answerKey: 'A', marks: 1 },
      { _id: 'q8', questionType: 'mcq', questionText: 'Which keyword defines a function in Python?', optionA: 'function', optionB: 'func', optionC: 'def', optionD: 'lambda', answerKey: 'C', marks: 1 },
      { _id: 'q9', questionType: 'mcq', questionText: 'What does len() return for "hello"?', optionA: '4', optionB: '5', optionC: '6', optionD: 'Error', answerKey: 'B', marks: 1 },
      { _id: 'q10', questionType: 'mcq', questionText: 'Which is immutable in Python?', optionA: 'list', optionB: 'dict', optionC: 'set', optionD: 'tuple', answerKey: 'D', marks: 1 },
      { _id: 'q11', questionType: 'mcq', questionText: 'How do you start a comment in Python?', optionA: '//', optionB: '/*', optionC: '#', optionD: '--', answerKey: 'C', marks: 1 },
      { _id: 'q12', questionType: 'mcq', questionText: 'What does range(3) produce?', optionA: '0,1,2', optionB: '1,2,3', optionC: '0,1,2,3', optionD: '1,2', answerKey: 'A', marks: 1 },
    ],
  },
  s3: {
    _id: 'e3', skill: { _id: 's3', name: 'React' }, examType: 'mcq',
    difficulty: 'intermediate', minScorePercent: 65, maxAttempts: 3, timeLimitMins: 25, attemptCount: 0,
    questions: [
      { _id: 'q13', questionType: 'mcq', questionText: 'What hook manages state in functional components?', optionA: 'useEffect', optionB: 'useState', optionC: 'useContext', optionD: 'useRef', answerKey: 'B', marks: 1 },
      { _id: 'q14', questionType: 'mcq', questionText: 'What is JSX?', optionA: 'A JavaScript framework', optionB: 'A syntax extension for JS', optionC: 'A CSS preprocessor', optionD: 'A database', answerKey: 'B', marks: 1 },
      { _id: 'q15', questionType: 'mcq', questionText: 'What does useEffect do?', optionA: 'Manages state', optionB: 'Handles side effects', optionC: 'Creates refs', optionD: 'Handles routing', answerKey: 'B', marks: 1 },
      { _id: 'q16', questionType: 'mcq', questionText: 'What is the virtual DOM?', optionA: 'A browser API', optionB: 'A lightweight copy of the real DOM', optionC: 'A database', optionD: 'A testing tool', answerKey: 'B', marks: 1 },
      { _id: 'q17', questionType: 'mcq', questionText: 'How do you pass data to child components?', optionA: 'state', optionB: 'props', optionC: 'context', optionD: 'refs', answerKey: 'B', marks: 1 },
    ],
  },
  s5: {
    _id: 'e5', skill: { _id: 's5', name: 'Graphic Design' }, examType: 'portfolio',
    difficulty: 'beginner', minScorePercent: 60, maxAttempts: 3, timeLimitMins: 20, attemptCount: 0,
    questions: [
      { _id: 'q18', questionType: 'portfolio', questionText: 'Please provide a link to your Graphic Design portfolio (Behance, Dribbble, or personal site).', marks: 10 },
    ],
  },
  s6: {
    _id: 'e6', skill: { _id: 's6', name: 'UI/UX Design' }, examType: 'portfolio',
    difficulty: 'beginner', minScorePercent: 60, maxAttempts: 3, timeLimitMins: 20, attemptCount: 0,
    questions: [
      { _id: 'q19', questionType: 'portfolio', questionText: 'Please provide a link to your UI/UX case studies or Figma files.', marks: 10 },
    ],
  },
  s7: {
    _id: 'e7', skill: { _id: 's7', name: 'Spanish Language' }, examType: 'mcq',
    difficulty: 'beginner', minScorePercent: 70, maxAttempts: 3, timeLimitMins: 20, attemptCount: 0,
    questions: [
      { _id: 'q20', questionType: 'mcq', questionText: 'How do you say "Hello" in Spanish?', optionA: 'Bonjour', optionB: 'Hola', optionC: 'Ciao', optionD: 'Hallo', answerKey: 'B', marks: 1 },
      { _id: 'q21', questionType: 'mcq', questionText: 'What is "Thank you" in Spanish?', optionA: 'Gracias', optionB: 'Merci', optionC: 'Danke', optionD: 'Obrigado', answerKey: 'A', marks: 1 },
      { _id: 'q22', questionType: 'mcq', questionText: '"Yo tengo" translates to?', optionA: 'I want', optionB: 'I have', optionC: 'I need', optionD: 'I am', answerKey: 'B', marks: 1 },
      { _id: 'q23', questionType: 'mcq', questionText: 'What is the Spanish word for "water"?', optionA: 'Fuego', optionB: 'Agua', optionC: 'Leche', optionD: 'Vino', answerKey: 'B', marks: 1 },
      { _id: 'q24', questionType: 'mcq', questionText: '"Buenos días" means?', optionA: 'Good night', optionB: 'Good morning', optionC: 'Good evening', optionD: 'Goodbye', answerKey: 'B', marks: 1 },
    ],
  },
  s8: {
    _id: 'e8', skill: { _id: 's8', name: 'Mathematics' }, examType: 'mcq',
    difficulty: 'intermediate', minScorePercent: 65, maxAttempts: 3, timeLimitMins: 25, attemptCount: 0,
    questions: [
      { _id: 'q25', questionType: 'mcq', questionText: 'What is the derivative of x²?', optionA: 'x', optionB: '2x', optionC: '2', optionD: 'x²', answerKey: 'B', marks: 1 },
      { _id: 'q26', questionType: 'mcq', questionText: 'What is ∫2x dx?', optionA: 'x²+C', optionB: '2x²+C', optionC: 'x+C', optionD: '2+C', answerKey: 'A', marks: 1 },
      { _id: 'q27', questionType: 'mcq', questionText: 'What is the value of sin(90°)?', optionA: '0', optionB: '0.5', optionC: '1', optionD: '-1', answerKey: 'C', marks: 1 },
      { _id: 'q28', questionType: 'mcq', questionText: 'What is log₁₀(100)?', optionA: '1', optionB: '2', optionC: '10', optionD: '100', answerKey: 'B', marks: 1 },
      { _id: 'q29', questionType: 'mcq', questionText: 'What is the quadratic formula?', optionA: 'x=b/2a', optionB: 'x=(-b±√(b²-4ac))/2a', optionC: 'x=a+b', optionD: 'x=a²+b²', answerKey: 'B', marks: 1 },
    ],
  },
};

export const TEACHERS = [
  {
    _id: 't1', name: 'Alice Chen', email: 'alice@demo.com', role: 'teacher',
    college: 'MIT', bio: 'Senior Frontend Engineer with 5 years experience. Passionate about UI/UX and React.',
    ratingAvg: 4.8, ratingCount: 24, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice&backgroundColor=b6e3f4',
    skillsOffered: [
      { _id: 's3', name: 'React', icon: '⚛️', category: 'Programming' },
      { _id: 's1', name: 'JavaScript', icon: '⚡', category: 'Programming' },
      { _id: 's6', name: 'UI/UX Design', icon: '📐', category: 'Design' },
    ],
    skillsWanted: [],
    verifiedSkills: [
      { skill: { _id: 's3', name: 'React' }, scorePercent: 92 },
      { skill: { _id: 's1', name: 'JavaScript' }, scorePercent: 88 },
    ],
  },
  {
    _id: 't2', name: 'Bob Smith', email: 'bob@demo.com', role: 'both',
    college: 'Stanford', bio: 'Data Scientist specializing in Machine Learning and Python. I love teaching complex concepts simply.',
    ratingAvg: 4.9, ratingCount: 41, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob&backgroundColor=c0aede',
    skillsOffered: [
      { _id: 's2', name: 'Python', icon: '🐍', category: 'Programming' },
      { _id: 's4', name: 'Data Structures', icon: '🏗️', category: 'Programming' },
    ],
    skillsWanted: [],
    verifiedSkills: [
      { skill: { _id: 's2', name: 'Python' }, scorePercent: 97 },
    ],
  },
  {
    _id: 't3', name: 'Charlie Davis', email: 'charlie@demo.com', role: 'teacher',
    college: 'Berklee', bio: "Professional Guitarist and Music Theory instructor. Let's rock!",
    ratingAvg: 4.7, ratingCount: 15, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffd5dc',
    skillsOffered: [
      { _id: 's10', name: 'Guitar', icon: '🎸', category: 'Music' },
    ],
    skillsWanted: [],
    verifiedSkills: [],
  },
  {
    _id: 't4', name: 'Diana Prince', email: 'diana@demo.com', role: 'teacher',
    college: 'NYU', bio: 'Expert in Graphic Design and Photography. Visual storytelling is my passion.',
    ratingAvg: 5.0, ratingCount: 32, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana&backgroundColor=d1f4d1',
    skillsOffered: [
      { _id: 's5', name: 'Graphic Design', icon: '🎨', category: 'Design' },
      { _id: 's11', name: 'Photography', icon: '📷', category: 'Creative' },
    ],
    skillsWanted: [],
    verifiedSkills: [],
  },
  {
    _id: 't5', name: 'Priya Nair', email: 'priya@demo.com', role: 'both',
    college: 'IIT Bombay', bio: 'Mathematics enthusiast and competitive programmer. I make math fun!',
    ratingAvg: 4.6, ratingCount: 18, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffeaa7',
    skillsOffered: [
      { _id: 's8', name: 'Mathematics', icon: '📊', category: 'Academic' },
      { _id: 's7', name: 'Spanish Language', icon: '🇪🇸', category: 'Language' },
    ],
    skillsWanted: [],
    verifiedSkills: [
      { skill: { _id: 's8', name: 'Mathematics' }, scorePercent: 95 },
    ],
  },
  {
    _id: 't6', name: 'Marcus Lee', email: 'marcus@demo.com', role: 'teacher',
    college: 'UCLA', bio: 'Public speaking coach and communication expert. Helping people find their voice.',
    ratingAvg: 4.5, ratingCount: 27, isActive: true,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=a8edea',
    skillsOffered: [
      { _id: 's12', name: 'Public Speaking', icon: '🎤', category: 'Soft Skills' },
    ],
    skillsWanted: [],
    verifiedSkills: [],
  },
];

export const DEMO_REVIEWS = [
  { _id: 'r1', reviewer: { _id: 'u1', name: 'Rahul Sharma', avatarUrl: '' }, rating: 5, comment: 'Alice is an amazing teacher! Explained React hooks so clearly.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: 'r2', reviewer: { _id: 'u2', name: 'Meera Patel', avatarUrl: '' }, rating: 4, comment: 'Great session, very patient and knowledgeable.', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

export const OFF_TOPIC_KEYWORDS = [
  'cricket', 'football', 'movie', 'film', 'actor', 'actress', 'song', 'music',
  'boyfriend', 'girlfriend', 'dating', 'love', 'romance', 'party', 'alcohol',
  'shopping', 'fashion', 'clothes', 'celebrity', 'gossip', 'politics', 'religion',
  'game', 'pubg', 'fortnite', 'minecraft', 'meme', 'funny', 'joke',
];

export const INAPPROPRIATE_KEYWORDS = [
  'hate', 'kill', 'die', 'stupid', 'idiot', 'abuse', 'insult',
];

export const moderateMessage = (text: string): { label: string; reason: string } => {
  const lower = text.toLowerCase();
  const inappropriate = INAPPROPRIATE_KEYWORDS.find(k => lower.includes(k));
  if (inappropriate) return { label: 'inappropriate', reason: `Contains inappropriate language: "${inappropriate}"` };
  if (text.length > 500) return { label: 'spam', reason: 'Message too long' };
  const offTopic = OFF_TOPIC_KEYWORDS.find(k => lower.includes(k));
  const hasSkillWord = ['code', 'learn', 'teach', 'skill', 'help', 'explain', 'how', 'what', 'question', 'practice', 'example'].some(k => lower.includes(k));
  if (offTopic && !hasSkillWord) return { label: 'off-topic', reason: `Potentially off-topic: "${offTopic}"` };
  return { label: 'safe', reason: 'Message is on-topic' };
};
