export interface Assessment {
  id: string;
  client_id: string;
  type: AssessmentType;
  score: number;
  max_score: number;
  severity: AssessmentSeverity;
  answers: AssessmentAnswer[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AssessmentType = 'phq9' | 'gad7' | 'bdi' | 'bai' | 'pcl5' | 'custom';

export type AssessmentSeverity = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

export interface AssessmentAnswer {
  question_id: number;
  question: string;
  answer: number;
  max_value: number;
}

export interface AssessmentTemplate {
  type: AssessmentType;
  name: string;
  description: string;
  questions: AssessmentQuestion[];
  scoring: AssessmentScoring;
  severity_levels: SeverityLevel[];
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  value: number;
  label: string;
  description?: string;
}

export interface AssessmentScoring {
  min_score: number;
  max_score: number;
  interpretation: string;
}

export interface SeverityLevel {
  min_score: number;
  max_score: number;
  level: AssessmentSeverity;
  label: string;
  color: string;
  recommendation: string;
}

// Predefined Assessment Templates
export const ASSESSMENT_TEMPLATES: Record<AssessmentType, AssessmentTemplate> = {
  phq9: {
    type: 'phq9',
    name: 'PHQ-9 (Patient Health Questionnaire)',
    description: '9-item depression screening tool',
    questions: [
      {
        id: 1,
        question: 'Little interest or pleasure in doing things?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 2,
        question: 'Feeling down, depressed, or hopeless?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 3,
        question: 'Trouble falling or staying asleep, or sleeping too much?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 4,
        question: 'Feeling tired or having little energy?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 5,
        question: 'Poor appetite or overeating?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 6,
        question: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 7,
        question: 'Trouble concentrating on things, such as reading the newspaper or watching television?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 8,
        question: 'Moving or speaking slowly enough that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 9,
        question: 'Thoughts that you would be better off dead or of hurting yourself in some way?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }
    ],
    scoring: {
      min_score: 0,
      max_score: 27,
      interpretation: 'Total score indicates depression severity'
    },
    severity_levels: [
      { min_score: 0, max_score: 4, level: 'minimal', label: 'Minimal Depression', color: '#10B981', recommendation: 'Monitor symptoms' },
      { min_score: 5, max_score: 9, level: 'mild', label: 'Mild Depression', color: '#F59E0B', recommendation: 'Watchful waiting' },
      { min_score: 10, max_score: 14, level: 'moderate', label: 'Moderate Depression', color: '#F97316', recommendation: 'Consider treatment' },
      { min_score: 15, max_score: 19, level: 'moderately_severe', label: 'Moderately Severe', color: '#EF4444', recommendation: 'Active treatment' },
      { min_score: 20, max_score: 27, level: 'severe', label: 'Severe Depression', color: '#DC2626', recommendation: 'Immediate treatment' }
    ]
  },
  gad7: {
    type: 'gad7',
    name: 'GAD-7 (Generalized Anxiety Disorder)',
    description: '7-item anxiety screening tool',
    questions: [
      {
        id: 1,
        question: 'Feeling nervous, anxious, or on edge?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 2,
        question: 'Not being able to stop or control worrying?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 3,
        question: 'Worrying too much about different things?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 4,
        question: 'Trouble relaxing?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 5,
        question: 'Being so restless that it\'s hard to sit still?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 6,
        question: 'Becoming easily annoyed or irritable?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 7,
        question: 'Feeling afraid, as if something awful might happen?',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }
    ],
    scoring: {
      min_score: 0,
      max_score: 21,
      interpretation: 'Total score indicates anxiety severity'
    },
    severity_levels: [
      { min_score: 0, max_score: 4, level: 'minimal', label: 'Minimal Anxiety', color: '#10B981', recommendation: 'Monitor symptoms' },
      { min_score: 5, max_score: 9, level: 'mild', label: 'Mild Anxiety', color: '#F59E0B', recommendation: 'Watchful waiting' },
      { min_score: 10, max_score: 14, level: 'moderate', label: 'Moderate Anxiety', color: '#F97316', recommendation: 'Consider treatment' },
      { min_score: 15, max_score: 21, level: 'severe', label: 'Severe Anxiety', color: '#EF4444', recommendation: 'Active treatment' }
    ]
  },
  bdi: {
    type: 'bdi',
    name: 'BDI (Beck Depression Inventory)',
    description: '21-item depression assessment',
    questions: [
      // Simplified version - in practice this would have 21 questions
      {
        id: 1,
        question: 'Sadness',
        options: [
          { value: 0, label: 'I do not feel sad' },
          { value: 1, label: 'I feel sad' },
          { value: 2, label: 'I am sad all the time' },
          { value: 3, label: 'I am so sad and unhappy that I can\'t stand it' }
        ]
      }
    ],
    scoring: {
      min_score: 0,
      max_score: 63,
      interpretation: 'Total score indicates depression severity'
    },
    severity_levels: [
      { min_score: 0, max_score: 13, level: 'minimal', label: 'Minimal Depression', color: '#10B981', recommendation: 'Monitor symptoms' },
      { min_score: 14, max_score: 19, level: 'mild', label: 'Mild Depression', color: '#F59E0B', recommendation: 'Watchful waiting' },
      { min_score: 20, max_score: 28, level: 'moderate', label: 'Moderate Depression', color: '#F97316', recommendation: 'Consider treatment' },
      { min_score: 29, max_score: 63, level: 'severe', label: 'Severe Depression', color: '#EF4444', recommendation: 'Active treatment' }
    ]
  },
  bai: {
    type: 'bai',
    name: 'BAI (Beck Anxiety Inventory)',
    description: '21-item anxiety assessment',
    questions: [
      // Simplified version - in practice this would have 21 questions
      {
        id: 1,
        question: 'Numbness or tingling',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Mildly' },
          { value: 2, label: 'Moderately' },
          { value: 3, label: 'Severely' }
        ]
      }
    ],
    scoring: {
      min_score: 0,
      max_score: 63,
      interpretation: 'Total score indicates anxiety severity'
    },
    severity_levels: [
      { min_score: 0, max_score: 7, level: 'minimal', label: 'Minimal Anxiety', color: '#10B981', recommendation: 'Monitor symptoms' },
      { min_score: 8, max_score: 15, level: 'mild', label: 'Mild Anxiety', color: '#F59E0B', recommendation: 'Watchful waiting' },
      { min_score: 16, max_score: 25, level: 'moderate', label: 'Moderate Anxiety', color: '#F97316', recommendation: 'Consider treatment' },
      { min_score: 26, max_score: 63, level: 'severe', label: 'Severe Anxiety', color: '#EF4444', recommendation: 'Active treatment' }
    ]
  },
  pcl5: {
    type: 'pcl5',
    name: 'PCL-5 (PTSD Checklist for DSM-5)',
    description: '20-item self-report measure that assesses the 20 DSM-5 symptoms of PTSD',
    questions: [
      { id: 1, question: 'Repeated, disturbing, and unwanted memories of the stressful experience?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 2, question: 'Repeated, disturbing dreams of the stressful experience?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 3, question: 'Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 4, question: 'Feeling very upset when something reminded you of the stressful experience?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 5, question: 'Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 6, question: 'Avoiding memories, thoughts, or feelings related to the stressful experience?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 7, question: 'Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 8, question: 'Trouble remembering important parts of the stressful experience?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 9, question: 'Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 10, question: 'Blaming yourself or someone else for the stressful experience or what happened after it?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 11, question: 'Having strong negative feelings such as fear, horror, anger, guilt, or shame?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 12, question: 'Loss of interest in activities that you used to enjoy?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 13, question: 'Feeling distant or cut off from other people?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 14, question: 'Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 15, question: "Irritable behavior, angry outbursts, or acting aggressively?", options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 16, question: 'Taking too many risks or doing things that could cause you harm?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 17, question: 'Being “superalert” or watchful or on guard?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 18, question: 'Feeling jumpy or easily startled?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 19, question: 'Having difficulty concentrating?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]},
      { id: 20, question: 'Trouble falling or staying asleep?', options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little bit' },
        { value: 2, label: 'Moderately' },
        { value: 3, label: 'Quite a bit' },
        { value: 4, label: 'Extremely' }
      ]}
    ],
    scoring: {
      min_score: 0,
      max_score: 80,
      interpretation: 'Total score reflects PTSD symptom severity (cutoff around 31-33)'
    },
    severity_levels: [
      { min_score: 0, max_score: 10, level: 'minimal', label: 'Minimal', color: '#10B981', recommendation: 'Monitor' },
      { min_score: 11, max_score: 32, level: 'mild', label: 'Mild', color: '#F59E0B', recommendation: 'Watchful waiting' },
      { min_score: 33, max_score: 49, level: 'moderate', label: 'Moderate (≥33 suggests probable PTSD)', color: '#F97316', recommendation: 'Consider treatment' },
      { min_score: 50, max_score: 80, level: 'severe', label: 'Severe', color: '#EF4444', recommendation: 'Active treatment' }
    ]
  },
  custom: {
    type: 'custom',
    name: 'Custom Assessment',
    description: 'Custom assessment tool',
    questions: [],
    scoring: {
      min_score: 0,
      max_score: 100,
      interpretation: 'Custom scoring system'
    },
    severity_levels: []
  }
};

export function calculateAssessmentScore(answers: AssessmentAnswer[]): number {
  return answers.reduce((total, answer) => total + answer.answer, 0);
}

export function getAssessmentSeverity(score: number, template: AssessmentTemplate): AssessmentSeverity {
  const level = template.severity_levels.find(
    level => score >= level.min_score && score <= level.max_score
  );
  return level?.level || 'minimal';
}

export function getSeverityColor(severity: AssessmentSeverity, template: AssessmentTemplate): string {
  const level = template.severity_levels.find(level => level.level === severity);
  return level?.color || '#6B7280';
}
