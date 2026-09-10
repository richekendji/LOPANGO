import {
  getHouseSpecRows,
  type SellerHouse,
} from "@/lib/mock/houses";

export function HouseSpecsGrid({ house }: { house: SellerHouse }) {
  const rows = getHouseSpecRows(house);
  return (
    <div className="mt-3 border-t border-[#ebebeb] pt-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
        Composition
      </p>
      <dl className="grid grid-cols-2 gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl bg-[#f5f5f5] px-2.5 py-1.5"
          >
            <dt className="text-[10px] text-zinc-400">{row.label}</dt>
            <dd className="text-[13px] font-semibold text-zinc-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
