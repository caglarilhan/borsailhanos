"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { AssessmentAnswer, AssessmentType } from "@/types/assessments";
import { ASSESSMENT_TEMPLATES, calculateAssessmentScore, getAssessmentSeverity } from "@/types/assessments";

interface AssessmentFormProps {
  clientId: string;
  clientName: string;
  onComplete: (assessment: {
    client_id: string;
    type: AssessmentType;
    score: number;
    max_score: number;
    severity: string;
    answers: AssessmentAnswer[];
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function AssessmentForm({ clientId, clientName, onComplete, onCancel }: AssessmentFormProps) {
  const t = useTranslations("assessments");
  const [selectedType, setSelectedType] = React.useState<AssessmentType>('phq9');
  const [answers, setAnswers] = React.useState<AssessmentAnswer[]>([]);
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);

  const template = ASSESSMENT_TEMPLATES[selectedType];
  const totalQuestions = template.questions.length;

  React.useEffect(() => {
    // Initialize answers array
    const initialAnswers = template.questions.map(q => ({
      question_id: q.id,
      question: q.question,
      answer: 0,
      max_value: Math.max(...q.options.map(o => o.value))
    }));
    setAnswers(initialAnswers);
  }, [selectedType, template.questions]);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => 
      prev.map(a => 
        a.question_id === questionId 
          ? { ...a, answer: value }
          : a
      )
    );
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const score = calculateAssessmentScore(answers);
      const severity = getAssessmentSeverity(score, template);
      
      const assessment = {
        client_id: clientId,
        type: selectedType,
        score,
        max_score: template.scoring.max_score,
        severity,
        answers,
        notes
      };

      await onComplete(assessment);
    } catch (error) {
      console.error('Assessment submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestionData = template.questions[currentQuestion];
  const currentAnswer = answers.find(a => a.question_id === currentQuestionData.id);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {template.name}
        </h2>
        <p className="text-gray-600 mb-2">{template.description}</p>
        <p className="text-sm text-gray-500">
          {t("client")}: <span className="font-medium">{clientName}</span>
        </p>
      </div>

      {/* Assessment Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("assessmentType")}
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as AssessmentType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={answers.length > 0}
        >
          {Object.entries(ASSESSMENT_TEMPLATES).map(([type, temp]) => (
            <option key={type} value={type}>
              {temp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{t("question")} {currentQuestion + 1} {t("of")} {totalQuestions}</span>
          <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQuestionData.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestionData.options.map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name={`question-${currentQuestionData.id}`}
                value={option.value}
                checked={currentAnswer?.answer === option.value}
                onChange={(e) => handleAnswerChange(currentQuestionData.id, parseInt(e.target.value))}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder={t("notesPlaceholder")}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("previous")}
        </button>

        <div className="flex gap-2">
          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!currentAnswer?.answer}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("next")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || answers.some(a => a.answer === 0)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("submitting") : t("complete")}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {currentQuestion === totalQuestions - 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{t("summary")}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t("totalScore")}:</span>
              <span className="ml-2 font-medium">
                {calculateAssessmentScore(answers)} / {template.scoring.max_score}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t("severity")}:</span>
              <span className="ml-2 font-medium">
                {getAssessmentSeverity(calculateAssessmentScore(answers), template)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
