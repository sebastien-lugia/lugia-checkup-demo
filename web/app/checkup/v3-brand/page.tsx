/**
 * /checkup/v3-brand — alias rétro-compatible.
 *
 * La route active a été renommée en /checkup/v3-charte le 2026-05-21
 * (refonte selon la charte d'application questionnaire v1.0).
 *
 * Cette page conserve les anciens liens (signets, URL partagées, sessions
 * en cours créées avant la bascule) en redirigeant vers la nouvelle route
 * tout en préservant la query string (interview=, view=, etc.).
 *
 * La version pré-charte reste accessible en lecture sur /checkup/v3-snapshot.
 *
 * D-033 : cohabitation v3-charte / v3-snapshot.
 */
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export default function V3BrandAlias({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.append(key, value);
    }
  }
  const suffix = qs.toString();
  redirect(`/checkup/v3-charte${suffix ? `?${suffix}` : ""}`);
}
