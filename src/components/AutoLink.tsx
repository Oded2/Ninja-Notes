'use client';

import Autolinker from 'autolinker';
import React from 'react';

type Props = {
  text: string;
};

export default function AutoLink({ text }: Props) {
  const linkedHtml = Autolinker.link(text.replaceAll('&', '&amp;'), {
    stripPrefix: false,
    decodePercentEncoding: false,
    className: 'underline',
    sanitizeHtml: true,
  });

  return (
    <p
      dir="auto"
      className="break-words whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}
