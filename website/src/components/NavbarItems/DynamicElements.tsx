import React from 'react';
import NavbarItem, { type Props as NavbarItemProps } from '@theme/NavbarItem';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';

const courseItems: Record<string, NavbarItemProps[]> = {
  'tg11-math': [
    {  label: 'Übersicht', to: '/tg11/math/overview', position: 'left' },
    {  label: 'Vektoren',  to: '/tg11/math/vektoren', position: 'left' },
  ],
  'tg12-math': [
    {  label: 'Übersicht',  to: '/tg12/math/overview',  position: 'left' },
    {  label: 'Stochastik', to: '/tg12/math/stochastik', position: 'left' },
  ],
};

export default function DynamicElements() {
  const active = useActivePlugin();
  const pluginId = active?.pluginId;
  const items = (pluginId && courseItems[pluginId]) || [];
  if (!items.length) return null;

  return (
    <>
      {items.map((it, i) => (
        <NavbarItem key={i} {...it} />
      ))}
    </>
  );
}