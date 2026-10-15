import { FileText, IndianRupee, Bot, Target, Users } from 'lucide-react';
import type { ElementType } from 'react';
import type { ApplicationStage } from '../types';

export const APPLICATION_STAGES: { id: ApplicationStage; label: string; icon: ElementType; blurb: string }[] = [
  { id: 'form', label: 'Apply', icon: FileText, blurb: 'Tell us about you, the venture and the problem. Save a draft any time and come back to it.' },
  { id: 'fee', label: 'Pay', icon: IndianRupee, blurb: 'A small processing fee confirms you are serious. You are asked for it once your form passes the first check.' },
  { id: 'ai_interview', label: 'Interview', icon: Bot, blurb: 'A short, recorded conversation with an AI interviewer about your answers. Take it when you are ready.' },
  { id: 'task', label: 'Assignment', icon: Target, blurb: 'A practical task on your problem. It shows how you work, and it is reviewed by the team.' },
  { id: 'panel', label: 'Discussion', icon: Users, blurb: 'A final conversation with the panel that decides the grant.' },
];

export const stageIndex = (stage: ApplicationStage | undefined) => Math.max(0, APPLICATION_STAGES.findIndex(s => s.id === (stage || 'form')));
