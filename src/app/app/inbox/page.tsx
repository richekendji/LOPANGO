"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  newId,
  type ContactRequest,
  type SellerHouse,
} from "@/lib/mock/houses";
import {
  deleteContact,
  getContacts,
  getHouses,
  saveContact,
  subscribeStore,
} from "@/lib/mock/store";

export default function InboxPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [houses, setHouses] = useState<SellerHouse[]>([]);
  const [editing, setEditing] = useState<ContactRequest | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "+242 ",
    message: "",
    houseId: "",
  });

  useEffect(() => {
    const refresh = () => {
      const h = getHouses();
      setHouses(h);
      setContacts(getContacts());
      setForm((f) => ({
        ...f,
        houseId: f.houseId || h[0]?.id || "",
      }));
    };
    refresh();
    return subscribeStore(refresh);
  }, []);

  function resetForm() {
    setEditing(null);
    setForm({
      name: "",
      phone: "+242 ",
      message: "",
      houseId: houses[0]?.id || "",
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim() || !form.houseId) return;
    const contact: ContactRequest = {
      id: editing?.id ?? newId("c"),
      name: form.name.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      houseId: form.houseId,
      createdAt: editing?.createdAt ?? "À l'instant",
    };
    saveContact(contact);
    resetForm();
  }

  function startEdit(c: ContactRequest) {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      message: c.message,
      houseId: c.houseId,
    });
  }

  function onDelete(id: string) {
    if (!confirm("Supprimer cette demande ?")) return;
    deleteContact(id);
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
      <div className="px-4 pb-4">
        <h1 className="text-lg font-bold text-zinc-900">Messages</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Demandes des locataires intéressés par vos maisons.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-5 space-y-3 rounded-[1.5rem] bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-bold text-zinc-900">
            {editing ? "Modifier la demande" : "Ajouter un contact test"}
          </p>
          <input
            className={field}
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={field}
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className={field}
            value={form.houseId}
            onChange={(e) => setForm({ ...form, houseId: e.target.value })}
            required
          >
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
          <textarea
            className={`${field} min-h-24`}
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white"
            >
              {editing ? "Enregistrer" : "Ajouter"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[#ebebeb] px-4 py-3 text-sm font-semibold"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 space-y-3">
          {contacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Aucune demande pour le moment.
            </p>
          ) : (
            contacts.map((c) => {
              const house = houses.find((h) => h.id === c.houseId);
              return (
                <article
                  key={c.id}
                  className="rounded-[1.5rem] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-zinc-900">{c.name}</p>
                      <p className="text-xs text-zinc-500">{c.phone}</p>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{c.message}</p>
                  {house && (
                    <Link
                      href={`/dashboard/houses/${house.id}`}
                      className="mt-2 inline-block text-xs font-semibold text-zinc-900 underline"
                    >
                      {house.title} →
                    </Link>
                  )}
                  <div className="mt-3 flex gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-zinc-700"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
  );
}
