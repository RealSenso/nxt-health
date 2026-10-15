import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { store } from '../../services/store';
import { Button, Card, Field, inputClass, Notice } from './adminUi';

/** Wording and sections of the public website that admins control without a code change. */
export const AdminSite: React.FC = () => {
  const [site, setSite] = useState<SiteSettings>(store.getSite());
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setSite({ ...site, [key]: value });

  const save = async () => {
    setBusy(true);
    try {
      await store.saveSite(site);
      setMessage({ ok: true, text: 'Saved. The website is updated.' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Announcement bar" hint="A single line shown at the very top of every page. Leave it empty to hide it.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Message" className="sm:col-span-2"><input className={inputClass} maxLength={240} value={site.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="Applications for the next cohort close on 30 November." /></Field>
          <Field label="Link" hint="A page on this site (like /problems) or an https:// link. Optional." className="sm:col-span-2">
            <input className={inputClass} value={site.announcement_link} onChange={(e) => set('announcement_link', e.target.value)} placeholder="/problems" />
          </Field>
        </div>
      </Card>

      <Card title="Home page" hint="Leave the headline and sentence empty to use the default wording.">
        <div className="grid gap-4">
          <Field label="Headline"><input className={inputClass} maxLength={160} value={site.hero_title} onChange={(e) => set('hero_title', e.target.value)} placeholder="Pharma has the problem. Doctors have the answer." /></Field>
          <Field label="Sentence under the headline"><textarea rows={2} className={inputClass} maxLength={400} value={site.hero_subtitle} onChange={(e) => set('hero_subtitle', e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={site.show_blogs} onChange={(e) => set('show_blogs', e.target.checked)} /> Show the blog section
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={site.show_startups} onChange={(e) => set('show_startups', e.target.checked)} /> Show the startups section
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="solid" disabled={busy} onClick={() => void save()}>Save website settings</Button>
        <Notice message={message} />
      </div>
    </div>
  );
};
