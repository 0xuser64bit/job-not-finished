"use client";

import Form from "next/form";
import { SHELF_SORTS, type ShelfSort } from "@/lib/shelf";

type Props = { q: string; lang: string; sort: ShelfSort; forks: boolean; languages: string[] };

const submit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  e.currentTarget.form?.requestSubmit();

/** Plain GET form: every filter state is a shareable URL. */
export function ShelfFilters({ q, lang, sort, forks, languages }: Props) {
  return (
    <Form
      action="/dashboard"
      role="search"
      aria-label="Filter the shelf"
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
    >
      <input type="hidden" name="tab" value="shelf" />
      <label className="grid gap-1.5 text-sm text-on-cloth-muted">
        Search
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Name or description"
          className="field"
        />
      </label>
      <label className="grid gap-1.5 text-sm text-on-cloth-muted">
        Language
        <select name="lang" defaultValue={lang} onChange={submit} className="field field-select">
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm text-on-cloth-muted">
        Sort
        <select name="sort" defaultValue={sort} onChange={submit} className="field field-select">
          {Object.entries(SHELF_SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-on-cloth-muted sm:col-span-3">
        <input
          type="checkbox"
          name="forks"
          value="1"
          defaultChecked={forks}
          onChange={submit}
          className="size-4 accent-manila"
        />
        Include forks
      </label>
    </Form>
  );
}
