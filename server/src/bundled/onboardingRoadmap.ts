// "Get onboarded": how a startup earns a place on the platform. Built from the NXT Health Startup Vetting Process deck:
// three steps, three tests (timeliness, coachability, presentation), then a choice of how deep to go.
import type { RoadmapContent } from '../roadmapTypes.js';

type Task = RoadmapContent['phases'][number]['tasks'][number];
const t = (id: string, label: string, detail: string, sub_stage: string, o: Partial<Task> = {}): Task => ({
  id, label, detail, sub_stage, experts: '', resources: '', deliverable: '', depends_on: '', duration: '', owner: 'Founders', ...o,
});

export const ONBOARDING_ROADMAP: RoadmapContent = {
  category: 'cat-startup-onboarding',
  phases: [
    {
      no: 0,
      name: 'Apply',
      sub_stages: ['Choose a format', 'Answer the basics', 'Timeliness test'],
      tasks: [
        t('onb1-1', 'Pick the format that suits you', 'Apply by call, recorded video or live interview. The questions are the same for every format.', 'Choose a format'),
        t('onb1-2', 'Say what clinical problem you solve, and who has it', 'Be specific about the patient or clinician and what goes wrong today.', 'Answer the basics', { deliverable: 'Problem in two sentences' }),
        t('onb1-3', 'State your stage', 'Idea, prototype, pilot or revenue.', 'Answer the basics'),
        t('onb1-4', 'Describe where you are on regulatory and clinical validation', 'What approvals, studies or clinician input you have so far, and what you do not.', 'Answer the basics'),
        t('onb1-5', 'Share what you have raised and who is on the team', 'Funding to date and the people doing the work.', 'Answer the basics'),
        t('onb1-6', 'Tell us what you want: experts, access, validation or funding', 'This decides how we help you.', 'Answer the basics'),
        t('onb1-7', 'Finish your first 10 asks within 72 hours', 'After applying you get ten asks. The timeliness test is whether they are done within 72 hours; within 24 hours is ideal.', 'Timeliness test', { gate: 'Test 1', duration: '3 days', deliverable: 'First 10 asks completed' }),
      ],
    },
    {
      no: 1,
      name: 'ICP and positioning',
      sub_stages: ['Ideal customer', 'Reposition', 'Commercial deck', 'Coachability test'],
      tasks: [
        t('onb2-1', 'Fill out the ideal customer form', 'Define a specific customer and the buyer, who are often different people.', 'Ideal customer', { deliverable: 'Completed ICP form' }),
        t('onb2-2', 'Name who you will not sell to', 'Being clear about who is out of scope shows you understand your customer.', 'Ideal customer'),
        t('onb2-3', 'Reposition after our feedback', 'Update your thinking when it is challenged instead of explaining why the feedback does not apply to you.', 'Reposition', { experts: 'NXT coaching team' }),
        t('onb2-4', 'Draft your own commercial deck', 'The deck has to be yours, not ours. Return the work quickly.', 'Commercial deck', { deliverable: 'Commercial deck (draft)' }),
        t('onb2-5', 'Act on the coaching', 'The coachability test is whether you act on feedback instead of defending the old position.', 'Coachability test', { gate: 'Test 2', deliverable: 'Revised positioning and deck' }),
      ],
    },
    {
      no: 2,
      name: 'Interview and video',
      sub_stages: ['Interview', 'Coaching', 'Record', 'Expert rating'],
      tasks: [
        t('onb3-1', 'Present your deck story in the interview', 'Present to Dr Smita Karpate and Sasanka.', 'Interview', { experts: 'Dr Smita Karpate; Sasanka' }),
        t('onb3-2', 'Take coaching on the story, the delivery and the ask', 'Use the feedback to tighten the story before you record.', 'Coaching'),
        t('onb3-3', 'Record the 8-minute video', '0:00–1:00 the founder. 1:00–2:30 the problem. 2:30–4:00 the solution. 4:00–5:30 why it is big. 5:30–6:30 proof. 6:30–7:30 the plan. 7:30–8:00 the ask.', 'Record', { duration: '8 minutes', deliverable: '8-minute founder video' }),
        t('onb3-4', 'Publish the video on the platform', 'Upload it to the NXT platform so the expert network can see it.', 'Record'),
        t('onb3-5', 'Earn a rating from the expert network', 'Experts rate each video from 1 to 3 thumbs up (low, medium, high confidence) on whether the team can execute or get the idea funded. The presentation test asks: can this founder represent NXT in front of pharma, hospitals and experts?', 'Expert rating', { gate: 'Test 3', experts: 'NXT expert network' }),
      ],
    },
    {
      no: 3,
      name: 'After vetting',
      sub_stages: ['Choose how deep to go'],
      tasks: [
        t('onb4-1', 'Join as a member', '$49 a month for monthly membership on the platform.', 'Choose how deep to go'),
        t('onb4-2', 'Get considered for funded projects', 'Problems that pharma or hospitals fund through NXT.', 'Choose how deep to go'),
        t('onb4-3', 'Explore a deeper partnership', 'Equity: NXT joins the cap table, evaluated through a separate form.', 'Choose how deep to go'),
      ],
    },
  ],
};
