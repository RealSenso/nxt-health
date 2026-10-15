import React from 'react';
import { Link } from 'react-router-dom';
import { store } from '../../services/store';

/** A one-line notice set by admins in Site settings, shown at the top of every page when there is one. */
export const AnnouncementBar: React.FC = () => {
  const { announcement, announcement_link: link } = store.getSite();
  if (!announcement) return null;
  const text = <span className="font-semibold">{announcement}</span>;
  return (
    <div className="bg-[var(--nxt-ink-fixed)] text-white text-center text-sm px-4 py-2" role="status">
      {link
        ? (/^https:/.test(link)
          ? <a href={link} target="_blank" rel="noreferrer" className="underline underline-offset-2">{text}</a>
          : <Link to={link} className="underline underline-offset-2">{text}</Link>)
        : text}
    </div>
  );
};
