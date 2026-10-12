export function slugify(text: string): string {
  return text
    .replace(/\s*\([^)]*\)/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function handleBadgeError(event: Event, teamName?: string, countryFlag?: string) {
  const img = event.target as HTMLImageElement;
  if (!img) return;

  const currentStep = Number(img.getAttribute('data-fallback-step') || '0');
  const name = teamName || img.alt || '';
  const baseSlug = slugify(name);
  
  const cleanSlug = baseSlug
    .replace(/^(cd|sd|fc|cf|ud|ad|ca|rc|sc|as|us|vf|sv|1-fc|1-fsv|ser|clube-do|clube)-/, '')
    .replace(/-(cf|fc|sc|sd|cd|ac|bc|sad|ec|sp|pb|mg)$/, '');

  const shortSlug = baseSlug.replace(/-(de|del|di|of|la|le|las|los|do)-/g, '-');
  const cleanShortSlug = cleanSlug.replace(/-(de|del|di|of|la|le|las|los|do)-/g, '-');

  const candidatesSet = new Set<string>();

  [baseSlug, shortSlug, cleanSlug, cleanShortSlug].forEach(slug => {
    if (!slug) return;
    candidatesSet.add(`https://www.bibliotecariodelfutbol.com/api/logo/${slug}`);
    candidatesSet.add(`https://assets.footylogos.com/logos/${slug}/${slug}-logo-footylogos.svg`);
    candidatesSet.add(`https://assets.footylogos.com/logos/${slug}-logo-footylogos.svg`);
    candidatesSet.add(`https://assets.footylogos.com/previews/${slug}/${slug}-logo-footylogos-320.webp`);
    candidatesSet.add(`https://assets.footylogos.com/previews/${slug}/${slug}-logo-footylogos.png`);
  });

  if (countryFlag && countryFlag.startsWith('http')) {
    candidatesSet.add(countryFlag);
  }

  const fallbacks = Array.from(candidatesSet);

  if (currentStep < fallbacks.length) {
    const nextUrl = fallbacks[currentStep];
    img.setAttribute('data-fallback-step', String(currentStep + 1));
    img.src = nextUrl;
  } else {
    img.onerror = null;
  }
}
