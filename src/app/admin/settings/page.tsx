import { getSettings } from "@/lib/data";
import { saveSettings } from "@/app/actions";
import ImageUploader from "@/components/ImageUploader";

export default async function SettingsPage() {
  const c = await getSettings();
  const H = ({ t }: { t: string }) => <h3 style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: ".06em", margin: "24px 0 14px" }}>{t}</h3>;
  const F = ({ k, label, area = false, ph = "" }: { k: keyof typeof c; label: string; area?: boolean; ph?: string }) => (
    <label className="field"><span>{label}</span>{area ? <textarea name={k} defaultValue={String(c[k] ?? "")} /> : <input name={k} defaultValue={String(c[k] ?? "")} placeholder={ph} />}</label>);
  return (<form action={saveSettings} className="editor"><div>
    <H t="BRAND" /><F k="brand" label="Brand name" /><F k="tagline" label="Tagline" /><F k="since_year" label="Since (year)" />
    <H t="HERO" /><F k="hero_headline" label="Headline" />
    <H t="ABOUT" /><F k="about_lead" label="Intro sentence (under the photo strip)" area /><F k="about_heading" label="Big heading" /><F k="about_body" label="Body — blank line between paragraphs" area />
    <p className="small muted">The photo strip on the About page is built from your product and hero photos automatically.</p>
    <H t="PAYMENT & CONTACT" /><F k="upi_id" label="UPI ID (customers pay here)" ph="name@bank" /><F k="payee_name" label="Payee name (shown in UPI app)" />
    <F k="shipping_note" label="Shipping note" /><F k="contact_email" label="Contact email" /><F k="instagram" label="Instagram handle" />
    <button className="btn" style={{ marginTop: 8 }}>Save settings</button>
  </div><div>
    <div className="field"><span>Hero photos (rotate every 5 s)</span><ImageUploader name="hero_images" initial={c.hero_images} hero /></div>
    <div className="field"><span>About image (portrait)</span><ImageUploader name="about_image" initial={c.about_image ? [c.about_image] : []} multiple={false} /></div>
  </div></form>);
}
