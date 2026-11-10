/**
 * Configuração da entidade. Outra entidade do JURIS 5.0 troca este objecto
 * e os ficheiros do logótipo, sem alterar componentes.
 */
export const entity = {
  id: "csmj",
  name: "Conselho Superior da Magistratura Judicial",
  shortName: "CSMJ",
  productName: "Intranet",
  programme: "Projecto JURIS 5.0",
  logo: {
    onBrand: "/brand/csmj-logotipo-ouro.svg",
    onLight: "/brand/csmj-logotipo-preto.svg",
    onDark: "/brand/csmj-logotipo-ouro.svg",
    white: "/brand/csmj-logotipo-branco.svg",
    symbol: "/brand/csmj-simbolo-ouro.svg",
    ratio: 954 / 261,
  },
  colors: {
    primary: "#852418",
    primaryHover: "#6C1D13",
    primaryActive: "#4F140D",
    primarySoft: "#FCF4F3",
    primaryDark: "#E39E96",
    primaryDarkHover: "#F0C7C2",
    accent: "#E1B229",
  },
  contacts: {
    address: "Luanda, Angola",
    phone: "+244 222 000 000",
    email: "secretariado@exemplo.ao",
    support: "apoio@exemplo.ao",
  },
  footer: [
    {
      title: "Sistemas JURIS",
      links: [
        { label: "Tramitação electrónica", href: "/ajuda/sistemas/tramitacao" },
        { label: "Gestão de processos", href: "/ajuda/sistemas/processos" },
        { label: "Estatística judicial", href: "/ajuda/sistemas/estatistica" },
      ],
    },
    {
      title: "Entidades parceiras",
      links: [
        { label: "Ministério da Justiça e dos Direitos Humanos", href: "/ajuda/parceiros/mjdh" },
        { label: "Procuradoria-Geral da República", href: "/ajuda/parceiros/pgr" },
        { label: "Ordem dos Advogados de Angola", href: "/ajuda/parceiros/oaa" },
      ],
    },
    {
      title: "Apoio",
      links: [
        { label: "Como usar a intranet", href: "/ajuda" },
        { label: "Contactar o apoio", href: "/ajuda/contacto" },
        { label: "Atalhos de teclado", href: "/ajuda/atalhos" },
      ],
    },
  ],
  timeZone: "Africa/Luanda",
  locale: "pt-AO",
} as const;

/** CSS injectado no <head>: é aqui que a marca muda por entidade. */
export function brandStyle(): string {
  const c = entity.colors;
  return `:root:root,[data-theme][data-theme]{--ds-color-brand-50:${c.primarySoft};--ds-color-brand-300:${c.primaryDark};--ds-color-brand-200:${c.primaryDarkHover};--ds-color-brand-700:${c.primary};--ds-color-brand-800:${c.primaryHover};--ds-color-brand-900:${c.primaryActive};--ds-color-gold-400:${c.accent};}`;
}
