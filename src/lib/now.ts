import nowYaml from '/content/now.yaml?raw';
import { parse as parseYaml } from 'yaml';
import type { NowEntry } from '@/types';

export function loadNow(): NowEntry {
  const data = parseYaml(nowYaml);
  return data as NowEntry;
}
