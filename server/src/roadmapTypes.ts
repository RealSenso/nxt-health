import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

export const roadmapTaskSchema = z.object({
  id: text(60).min(1),
  label: text(300).min(1),
  detail: text(1000),
  sub_stage: text(100),
  experts: text(300),
  resources: text(500),
  deliverable: text(300),
  depends_on: text(300),
  duration: text(40),
  gate: text(40).optional(),
  owner: text(100),
});

export const playbookSchema = z.object({
  model: z.array(z.object({ component: text(80), question: text(300), output: text(200) })).max(30),
  cost_inputs: z.array(z.object({ category: text(80), input: text(200), why: text(300), approach: text(300) })).max(30),
  how_to_use: z.array(text(400)).max(20),
});

/**
 * A roadmap built from a checklist: each phase becomes a step and each row a task.
 * The checklist content itself is not part of this repository — it is imported by an admin
 * (Admin console → Categories → Import roadmap file) or loaded from server/content/ by the scripts.
 */
export const roadmapContentSchema = z.object({
  /** Id of the category this checklist is written for (e.g. cat-samd). Without it, it is the general checklist used by the other open categories. */
  category: z.string().regex(/^cat-[a-z0-9-]+$/).max(60).optional(),
  phases: z.array(z.object({
    no: z.number().int().min(0).max(99),
    name: text(80).min(1),
    sub_stages: z.array(text(100)).max(30),
    tasks: z.array(roadmapTaskSchema).max(100),
  })).min(1).max(30),
  playbook: playbookSchema.optional(),
});

export type RoadmapContent = z.infer<typeof roadmapContentSchema>;
export type RoadmapPhase = RoadmapContent['phases'][number];
export type RoadmapTask = z.infer<typeof roadmapTaskSchema>;
