"use client";

import { useState } from "react";
import {
  formatLocalPart,
  type PhonePrefix,
} from "@/lib/phone";
import { SelectField } from "@/components/SelectField";

const field =
  "rounded-2xl border border-[#ebebeb] bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

type Props = {
  defaultPrefix?: PhonePrefix;
  defaultLocal?: string;
  name?: string;
};

/** Saisie numéro Congo : préfixe 06/05 + local 123 45 67 */
export function PhoneInput({
  defaultPrefix = "06",
  defaultLocal = "",
  name = "phone",
}: Props) {
  const [prefix, setPrefix] = useState<PhonePrefix>(defaultPrefix);
  const [local, setLocal] = useState(formatLocalPart(defaultLocal));

  const normalized = `${prefix}${local.replace(/\D/g, "")}`;

  return (
    <div className="space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Numéro
      </span>
      <div className="flex gap-2">
        <SelectField
          compact
          value={prefix}
          onChange={(e) => setPrefix(e.target.value as PhonePrefix)}
          aria-label="Préfixe"
        >
          <option value="06">06</option>
          <option value="05">05</option>
        </SelectField>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className={`${field} min-w-0 flex-1 font-mono`}
          placeholder="123 45 67"
          value={local}
          onChange={(e) => setLocal(formatLocalPart(e.target.value))}
          maxLength={9}
          required
        />
      </div>
      <input type="hidden" name={name} value={normalized} />
      <p className="text-[11px] text-zinc-400">
        Format : {prefix} 123 45 67
      </p>
    </div>
  );
}
