"use client";

import Link from "next/link";
import { ComponentProps, useEffect, useState } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function CtaLink({ href, ...props }: Props) {
  const [finalHref, setFinalHref] = useState(href);

  useEffect(() => {
    const search = window.location.search;
    if (search) setFinalHref(`${href}${search}`);
  }, [href]);

  return <Link href={finalHref} {...props} />;
}
