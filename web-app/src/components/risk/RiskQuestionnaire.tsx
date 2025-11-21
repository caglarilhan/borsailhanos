import { FormEvent, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { evaluateRiskProfile, RiskQuestionAnswer } from '@/services/riskEngine';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

const QUESTIONS = [
  {
    id: 'horizon',
    title: 'Yatırım ufkunuz',
    description: 'Sermayenizi ne kadar süre değerlendirmeyi planlıyorsunuz?',
  },
  {
    id: 'drawdown',
    title: 'Geçici kayıplara tolerans',
    description: 'Portföyünüzde %10 düşüş görürseniz tepkiniz ne olur?',
  },
  {
    id: 'volatility',
    title: 'Volatilite tercihi',
    description: 'Yüksek getiri için günlük oynaklığa ne kadar tahammül edersiniz?',
  },
] as const;

const SCALE_LABELS = ['Çok Düşük', 'Düşük', 'Orta', 'Yüksek', 'Çok Yüksek'];

export function RiskQuestionnaire() {
  const [answers, setAnswers] = useState<Record<string, number>>({
    horizon: 3,
    drawdown: 3,
    volatility: 3,
  });

  const mutation = useMutation({
    mutationKey: ['risk-profile'],
    mutationFn: (payload: RiskQuestionAnswer[]) => evaluateRiskProfile(payload),
  });

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: RiskQuestionAnswer[] = QUESTIONS.map((question) => ({
      questionId: question.id,
      value: answers[question.id],
    }));
    mutation.mutate(payload);
  };

  const profileMeta = useMemo(() => {
    const profile = mutation.data?.data.profile;
    if (!profile) return null;
    if (profile === 'Conservative') {
      return { color: 'amber' as const, text: 'Conservative', helper: 'Düşük risk - sabit getiri' };
    }
    if (profile === 'Aggressive') {
      return { color: 'red' as const, text: 'Aggressive', helper: 'Yüksek risk - büyüme odaklı' };
    }
    return { color: 'blue' as const, text: 'Balanced', helper: 'Risk / getiri dengesi' };
  }, [mutation.data]);

  return (
    <Card
      title="Risk Toleransı Testi"
      subtitle="3 soruluk hızlı profil analizi"
      className="col-span-12 xl:col-span-8"
      actions={
        profileMeta && (
          <div className="flex items-center gap-2">
            <Badge
              text={profileMeta.text}
              color={profileMeta.color}
              variant="solid"
            />
            <span className="text-xs text-slate-500">{profileMeta.helper}</span>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {QUESTIONS.map((question) => (
          <div key={question.id} className="rounded-xl border border-slate-100 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">{question.title}</p>
              <p className="text-xs text-slate-500">{question.description}</p>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={answers[question.id]}
              onChange={(event) => handleChange(question.id, Number(event.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              {SCALE_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={answers[question.id] === index + 1 ? 'font-medium text-slate-900' : undefined}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Hesaplanıyor...' : 'Profili Hesapla'}
        </button>

        {mutation.data && (
          <p className="text-center text-xs text-slate-500">
            Skor: {mutation.data.data.score} • Model {mutation.data.modelVersion}
          </p>
        )}
      </form>
    </Card>
  );
}

export default RiskQuestionnaire;

