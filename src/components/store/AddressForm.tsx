import { useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

export function AddressForm({ onAdded, submitLabel = "Save address" }: { onAdded?: () => void; submitLabel?: string }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", line1: "", city: "Lagos", state: "Lagos", isDefault: true });
  const add = trpc.shop.addAddress.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.shop.addresses.invalidate(), utils.shop.quote.invalidate()]);
      setForm((current) => ({ ...current, fullName: "", phone: "", line1: "" }));
      toast.success("Delivery address saved");
      onAdded?.();
    },
    onError: (error) => toast.error(error.message),
  });
  const field = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); add.mutate(form); };

  return <form className="address-form" onSubmit={submit}>
    <div className="form-grid two">
      <label>Address label<input required minLength={2} value={form.label} onChange={(e) => field("label", e.target.value)} placeholder="Home or office" /></label>
      <label>Full name<input required minLength={2} autoComplete="name" value={form.fullName} onChange={(e) => field("fullName", e.target.value)} placeholder="Recipient’s full name" /></label>
      <label>Phone number<input required minLength={7} autoComplete="tel" value={form.phone} onChange={(e) => field("phone", e.target.value)} placeholder="0800 000 0000" /></label>
      <label className="span-two">Street address<input required minLength={5} autoComplete="street-address" value={form.line1} onChange={(e) => field("line1", e.target.value)} placeholder="House number and street" /></label>
      <label>City<input required minLength={2} autoComplete="address-level2" value={form.city} onChange={(e) => field("city", e.target.value)} /></label>
      <label>State<input required minLength={2} autoComplete="address-level1" value={form.state} onChange={(e) => field("state", e.target.value)} /></label>
    </div>
    <label className="check-label"><input type="checkbox" checked={form.isDefault} onChange={(e) => field("isDefault", e.target.checked)} /> Make this my default address</label>
    <button className="btn-primary" disabled={add.isPending}>{add.isPending && <LoaderCircle className="spin" size={16} />}{submitLabel}</button>
  </form>;
}
