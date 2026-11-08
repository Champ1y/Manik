'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { portfolio } from '@/content/portfolio';
import type { Preferences } from '@/content/types';
import { recommendWorks } from '@/lib/portfolio';
import { track } from '@/lib/analytics';
import { Icon } from './icon';
import { WorkCard } from './portfolio-grid';
import { BookingButton } from './app-provider';

const steps = [
  { key: 'style', title: 'Что вам ближе?', description: 'Выберите настроение. Остальное сложится.', options: [
    { value: 'natural', title: 'Натуральный и спокойный', text: 'Нежно, сдержанно, на каждый день', color: '#d7b6a9', symbol: '' },
    { value: 'classic', title: 'Классический', text: 'Проверенные временем сочетания', color: '#e5dfd3', symbol: '' },
    { value: 'accent', title: 'С акцентом', text: 'Та самая маленькая деталь', color: '#7d8469', symbol: '' },
    { value: 'bold', title: 'Яркий и необычный', text: 'Цвет, который говорит за вас', color: '#762c46', symbol: '' },
  ] },
  { key: 'length', title: 'Какая длина — ваша?', description: 'Ориентируйтесь на привычки и ощущение комфорта.', options: [
    { value: 'short', title: 'Короткие', text: 'Практично и лаконично', color: '#dbc9bc', symbol: 'S' },
    { value: 'medium', title: 'Средние', text: 'Золотая середина', color: '#d7b6a9', symbol: 'M' },
    { value: 'long', title: 'Длинные', text: 'Больше пространства для идеи', color: '#b68b85', symbol: 'L' },
    { value: 'any', title: 'Пока не знаю', text: 'Рассмотрю разные варианты', color: '#e5dfd3', symbol: '?' },
  ] },
  { key: 'shade', title: 'А какое настроение в цвете?', description: 'Необязательно знать точный оттенок.', options: [
    { value: 'nude', title: 'Нюдовые', text: 'Тёплые и естественные', color: '#cfa59a', symbol: '' },
    { value: 'dark', title: 'Тёмные', text: 'Глубокие и выразительные', color: '#582b38', symbol: '' },
    { value: 'light', title: 'Светлые', text: 'Воздушные и нежные', color: '#f1eae1', symbol: '' },
    { value: 'bright', title: 'Яркие', text: 'Для особого настроения', color: '#c45170', symbol: '' },
    { value: 'any', title: 'Пока не определилась', text: 'Хочу вдохновиться', color: '#d4d0be', symbol: '?' },
  ] },
] as const;

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Preferences>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const isResult = step === steps.length;
  const current = steps[Math.min(step, 2)];
  const matches = isResult ? recommendWorks(portfolio, answers as Preferences) : [];
  function move(next: number) { setStep(next); requestAnimationFrame(() => heading.current?.focus()); }
  function select(value: string) {
    if (!started.current) { track('quiz_start'); started.current = true; }
    setAnswers(previous => ({ ...previous, [current.key]: value }));
  }
  function next() {
    if (!answers[current.key]) return;
    if (step === 2) track('quiz_complete', { style: answers.style!, length: answers.length!, shade: answers.shade! });
    move(step + 1);
  }
  if (isResult) return <div className="quiz-result">
    <span className="eyebrow">Ваше настроение найдено</span><h2 ref={heading} tabIndex={-1}>{matches.length ? 'Кажется, это про вас' : 'У вашей идеи свой характер'}</h2>
    <p className="section-description">{matches.length ? 'Эти дизайны совпали с выбранными стилем, длиной и оттенками. Откройте понравившийся — внутри найдёте услугу и путь к записи.' : 'Точных совпадений пока нет. Посмотрите все дизайны или обсудите идею с мастером — не будем подменять ваши пожелания случайным результатом.'}</p>
    {matches.some(work => work.demo) && <p className="demo-note">Пока это демонстрационные образцы. После добавления работ подбор будет использовать реальное портфолио.</p>}
    {matches.length ? <div className="portfolio-grid">{matches.map(work => <WorkCard key={work.id} work={work} />)}</div> : <div className="empty-state"><Icon name="spark" size={40} /><div className="button-row"><Link href="/portfolio/" className="button button-outline">Посмотреть все дизайны<Icon name="arrow" size={17} /></Link><BookingButton>Обсудить идею</BookingButton></div></div>}
    <button className="text-button restart-quiz" onClick={() => { setAnswers({}); started.current = false; move(0); }}><Icon name="back" size={17} />Пройти ещё раз</button>
  </div>;
  return <div className="quiz-panel">
    <div className="quiz-progress" aria-label={`Шаг ${step + 1} из 3`}>{steps.map((item, index) => <div key={item.key} className={index <= step ? 'complete' : ''}><span>0{index + 1}</span><span>{['Стиль', 'Длина', 'Оттенок'][index]}</span></div>)}</div>
    <div className="quiz-question"><span className="eyebrow">Шаг {step + 1} из 3</span><h2 ref={heading} tabIndex={-1}>{current.title}</h2><p>{current.description}</p></div>
    <div className="quiz-options" role="group" aria-label={current.title}>{current.options.map(option => <button key={option.value} className={`quiz-option ${answers[current.key] === option.value ? 'chosen' : ''}`} aria-pressed={answers[current.key] === option.value} onClick={() => select(option.value)}>
      <span className={`quiz-swatch step-${step}`} style={{ backgroundColor: option.color }}>{option.symbol}</span><span><strong>{option.title}</strong><small>{option.text}</small></span><span className="choice-circle">{answers[current.key] === option.value && <Icon name="check" size={14} />}</span>
    </button>)}</div>
    <div className="quiz-bottom"><button className="text-button" disabled={step === 0} onClick={() => move(step - 1)}><Icon name="back" size={17} />Назад</button><button className="button button-primary" disabled={!answers[current.key]} onClick={next}>{step === 2 ? 'Посмотреть подборку' : 'Продолжить'}<Icon name="arrow" size={18} /></button></div>
    <p className="fine-print quiz-explanation">Подбираем по тегам портфолио: стиль + длина + оттенок. Без ИИ и регистрации.</p>
  </div>;
}
