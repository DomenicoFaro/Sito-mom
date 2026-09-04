"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, type MenuCategory, type MenuItem, type MenuTag } from "@/lib/types";
import {
  deleteCategory,
  deleteMenuItem,
  toggleAvailability,
  upsertCategory,
  upsertMenuItem,
} from "./actions";

const TAG_OPTIONS: { value: MenuTag; label: string }[] = [
  { value: "piccante", label: "Piccante" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "nuovo", label: "Novità" },
  { value: "best_seller", label: "Best seller" },
];

export function MenuAdmin({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const [editingItem, setEditingItem] = useState<MenuItem | "new" | null>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const list = itemsByCategory.get(item.category_id) ?? [];
    list.push(item);
    itemsByCategory.set(item.category_id, list);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Gestione menù</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setNewCategoryOpen(true)}
            className="rounded-full border border-line px-4 py-2 text-sm text-ink-dim hover:border-gold hover:text-gold"
          >
            + Categoria
          </button>
          <button
            onClick={() => setEditingItem("new")}
            className="flex items-center gap-1.5 rounded-full bg-lacquer px-4 py-2 text-sm text-ink hover:bg-lacquer-bright"
          >
            <Plus size={15} /> Nuovo piatto
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg text-gold">{cat.name}</h2>
              <button
                onClick={() => {
                  if (confirm(`Eliminare la categoria "${cat.name}"?`)) deleteCategory(cat.id);
                }}
                className="text-xs text-ink-dim hover:text-lacquer-bright"
              >
                Elimina categoria
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-line/70">
              {(itemsByCategory.get(cat.id) ?? []).map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    i > 0 ? "border-t border-line/60" : ""
                  } ${item.available ? "" : "opacity-50"}`}
                >
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photo_url}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-abyss-card" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-ink-dim">{formatPrice(item.price_cents)}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-ink-dim">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={(e) => toggleAvailability(item.id, e.target.checked)}
                    />
                    Disponibile
                  </label>
                  <button onClick={() => setEditingItem(item)} className="text-ink-dim hover:text-gold">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminare "${item.name}"?`)) deleteMenuItem(item.id);
                    }}
                    className="text-ink-dim hover:text-lacquer-bright"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(itemsByCategory.get(cat.id) ?? []).length === 0 && (
                <p className="px-4 py-4 text-sm text-ink-dim">Nessun piatto in questa categoria.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {newCategoryOpen && (
        <CategoryModal onClose={() => setNewCategoryOpen(false)} />
      )}

      {editingItem && (
        <ItemModal
          item={editingItem === "new" ? null : editingItem}
          categories={categories}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

function CategoryModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nuova categoria" onClose={onClose}>
      <form
        action={async (fd) => {
          await upsertCategory(fd);
          onClose();
        }}
        className="space-y-4"
      >
        <Field label="Nome" name="name" required />
        <Field label="Ordine" name="sort_order" type="number" />
        <SubmitButton>Crea categoria</SubmitButton>
      </form>
    </Modal>
  );
}

function ItemModal({
  item,
  categories,
  onClose,
}: {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(item?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("menu-photos").upload(path, file, {
      upsert: true,
    });
    if (!error) {
      const { data } = supabase.storage.from("menu-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <Modal title={item ? "Modifica piatto" : "Nuovo piatto"} onClose={onClose}>
      <form
        action={async (fd) => {
          await upsertMenuItem(fd);
          onClose();
        }}
        className="space-y-4"
      >
        {item && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="photo_url" value={photoUrl} />

        <Field label="Nome" name="name" defaultValue={item?.name} required />

        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Categoria</label>
          <select
            name="category_id"
            defaultValue={item?.category_id ?? categories[0]?.id}
            className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Descrizione</label>
          <textarea
            name="description"
            defaultValue={item?.description}
            rows={2}
            className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Prezzo (€)"
            name="price"
            type="number"
            step="0.01"
            defaultValue={item ? (item.price_cents / 100).toFixed(2) : undefined}
          />
          <Field
            label="Supplemento AYCE (€)"
            name="surcharge"
            type="number"
            step="0.01"
            defaultValue={item ? (item.ayce_surcharge_cents / 100).toFixed(2) : undefined}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Foto del piatto</label>
          <div className="flex items-center gap-3">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-ink-dim hover:border-gold hover:text-gold">
              <Upload size={14} />
              {uploading ? "Caricamento…" : "Carica foto"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        <Field label="Allergeni (separati da virgola)" name="allergens" defaultValue={item?.allergens.join(", ")} />

        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">Tag</label>
          <div className="flex flex-wrap gap-3">
            {TAG_OPTIONS.map((tag) => (
              <label key={tag.value} className="flex items-center gap-1.5 text-xs text-ink-dim">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.value}
                  defaultChecked={item?.tags.includes(tag.value)}
                />
                {tag.label}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-dim">
          <input type="checkbox" name="available" defaultChecked={item?.available ?? true} />
          Disponibile
        </label>

        <SubmitButton>{item ? "Salva modifiche" : "Crea piatto"}</SubmitButton>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-abyss-soft p-6 thin-scroll">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl">{title}</h2>
          <button onClick={onClose} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-2.5 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-lacquer py-3 text-sm font-medium tracking-wide text-ink hover:bg-lacquer-bright"
    >
      {children}
    </button>
  );
}
