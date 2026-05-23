/**
 * /presentation — alias rétro-compatible vers /le-checkup.
 *
 * La page a été renommée le 2026-05-22 pour distinguer clairement de la
 * page entreprise /lugia. Cet alias conserve les anciens liens (bookmarks,
 * URL partagées) en redirigeant vers la nouvelle route.
 */
import { redirect } from "next/navigation";

export default function PresentationAlias() {
  redirect("/le-checkup");
}
