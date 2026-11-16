import { useTranslation } from "react-i18next";
import {
  translateResource,
  translateCardTitulo,
  translateCardTexto,
  translateCardTituloSmart,
  translateCardTextoSmart,
} from "./cardTranslations";

export function useCardTranslations() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return {
    resource: (nome: string) => translateResource(nome, lang),
    titulo: (id: string, fallback: string) =>
      translateCardTitulo(id, fallback, lang),
    texto: (id: string, fallback: string) =>
      translateCardTexto(id, fallback, lang),
    // Versões que respeitam customizações do usuário
    tituloSmart: (card: { id: string; titulo: string }) =>
      translateCardTituloSmart(card, lang),
    textoSmart: (card: { id: string; texto: string }) =>
      translateCardTextoSmart(card, lang),
  };
}