import React from 'react';
import { PageHeader } from './ui/PageHeader';

/** A page that only shows its title, for sections whose content is still to come. */
export const PlaceholderPage: React.FC<{ icon: React.ElementType; title: string }> = ({ icon, title }) => (
  <div className="space-y-8 lg:space-y-10">
    <PageHeader icon={icon} title={title} />
  </div>
);
